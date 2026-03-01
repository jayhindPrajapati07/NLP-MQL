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
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    async def generate_mql(self, natural_language_query: str, schema_context: dict) -> dict:
        """
        Given a user's question and the DB schema, asks Gemini to output
        the appropriate MongoDB Query Language (MQL) as JSON.
        """
        if not GENAI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured.")

        prompt = f"""
You are an expert MongoDB data analyst.
Convert the natural language query into a raw MongoDB Query Language (MQL) pipeline or find filter.

Database Schema provided as a dictionary (CollectionName: {{field: type}}):
{json.dumps(schema_context, indent=2)}

User Question: "{natural_language_query}"

Instructions:
1. Determine the correct collection to query.
2. Generate the appropriate MQL. Use MongoDB aggregation pipeline (a list of stages `[{{"$match": ...}}, ...]`) if grouping/sorting is needed, or a standard find query (`{{"filter": ...}}`).
3. Return ONLY valid JSON with two fields: "collection" (string) and "query" (either a list for aggregation, or a dict for a find query).
4. Do NOT include markdown code blocks, return raw JSON string only. Ensure the query is strictly READ-ONLY (no $out, $merge, etc.).

Expected Output Format Example:
{{
  "collection": "users",
  "query": [
    {{ "$match": {{ "age": {{ "$gte": 18 }} }} }},
    {{ "$group": {{ "_id": "$status", "count": {{ "$sum": 1 }} }} }}
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
