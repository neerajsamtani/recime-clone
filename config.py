import os


class Config:
    """Base configuration."""

    DEBUG = False
    TESTING = False

    # Request settings
    REQUEST_TIMEOUT = 30

    # AWS settings (used by RecipeParser)
    AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

    # Logging
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True
    TESTING = False


class TestingConfig(Config):
    """Testing configuration."""

    TESTING = True
    DEBUG = True


# Configuration dictionary
config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
