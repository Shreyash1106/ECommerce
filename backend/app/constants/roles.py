"""Role constants and validation for the application."""

# Valid roles
ROLE_ADMIN = "admin"
ROLE_VENDOR = "vendor"
ROLE_CUSTOMER = "customer"

# All valid roles
VALID_ROLES = {ROLE_ADMIN, ROLE_VENDOR, ROLE_CUSTOMER}

# Role groups
ADMIN_ROLES = {ROLE_ADMIN}
VENDOR_ROLES = {ROLE_VENDOR}
CUSTOMER_ROLES = {ROLE_CUSTOMER}
VENDOR_OR_ADMIN_ROLES = {ROLE_VENDOR, ROLE_ADMIN}

# Registration allowed roles (roles that can be assigned during registration)
REGISTRATION_ALLOWED_ROLES = {ROLE_CUSTOMER, ROLE_VENDOR}


def is_valid_role(role: str) -> bool:
    """Check if role is valid."""
    return role.lower() in VALID_ROLES


def is_registration_allowed_role(role: str) -> bool:
    """Check if role can be assigned during registration."""
    return role.lower() in REGISTRATION_ALLOWED_ROLES
