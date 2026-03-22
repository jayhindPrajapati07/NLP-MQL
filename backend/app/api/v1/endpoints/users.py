from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_active_user, get_current_admin_user
from app.models.user import UserResponse, UserInDB, UserCreate
from app.repositories.user import user_repository

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get current user details. Useful for RBAC on the frontend.
    """
    return current_user

@router.get("/", response_model=list[UserResponse])
async def list_all_users(
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """
    List all standard users (admin only)
    """
    users = await user_repository.get_all()
    # Filter out admins if strictly needed, or just return all
    return users

@router.post("/", response_model=UserResponse)
async def create_user(
    user_in: UserCreate,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """
    Create a new user (admin only)
    """
    existing_user = await user_repository.get_by_email(email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists."
        )
    new_user = await user_repository.create(user_in=user_in)
    return new_user

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """
    Delete a standard user (admin only)
    """
    user_to_delete = await user_repository.get_by_id(user_id)
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Prevent admin from deleting themselves
    if str(user_to_delete.id) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    await user_repository.delete(user_id)
    return {"status": "success"}
