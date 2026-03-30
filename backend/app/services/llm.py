import os
import json
import google.generativeai as genai

# Configure Gemini
GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

class LLMService:
    def __init__(self):
        # We use a model that handles instruct well
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    async def generate_mql(self, natural_language_query: str, schema_context: dict) -> dict:
        """
        Given a user's question and the DB schema, asks Gemini to output
        the appropriate MongoDB Query Language (MQL) as JSON.
        """
        if not GENAI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured.")

        prompt = f"""
You are an expert MongoDB data analyst.
Convert the natural language query into a raw MongoDB Aggregation Pipeline.

Database Schema provided as a dictionary (CollectionName: {{field: type}}):
{json.dumps(schema_context, indent=2)}

User Question: "{natural_language_query}"

Instructions:
1. Determine the correct collection to query.
2. Generate the appropriate MQL using strictly the MongoDB aggregation pipeline format. This must be a JSON array of stages (e.g., [{{ "$match": ... }}, {{ "$limit": 2 }}]).
3. IF the user asks to join or combine data across collections, use the `$lookup` and `$unwind` stages appropriately based on the `_relationships_guess` provided in the schema.
4. IF the user asks to aggregate by date or time, utilize the `$dateTrunc` operator to group accurately.
5. Return ONLY strictly valid JSON with exactly two fields: "collection" (string) and "query" (array).
4. The "query" field MUST be a List/Array representing the aggregation pipeline. NEVER return a dictionary for the "query" field.
5. Do NOT include markdown code blocks, backticks, or any non-JSON text. Return the raw JSON string only. Ensure the query is strictly READ-ONLY (no $out, $merge, etc.).
6. IF filtering by any string field (e.g., names, titles, categories), ALWAYS use `$regex` with `"$options": "i"` to ensure the search is case-insensitive and supports partial matching, unless the user explicitly asks for an exact match.

Expected Output Format Example:
{{
  "collection": "students",
  "query": [
    {{ "$match": {{ "age": {{ "$gte": 18 }} }} }},
    {{ "$limit": 5 }}
  ]
}}
"""
        response = self.model.generate_content(prompt)
        try:
            # Strip any potential markdown wrappers if the LLM ignores instructions
            cleaned_response = response.text.replace("```json", "").replace("```", "").strip()
            mql_data = json.loads(cleaned_response)
            return mql_data
        except Exception as e:
            raise ValueError(f"Failed to parse LLM response into JSON: {str(e)}\nRaw Response: {response.text}")

llm_service = LLMService()
