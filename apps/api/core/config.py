class Settings:
    lab_host: str = "127.0.0.1"
    max_concurrency: int = 8
    max_requests_per_run: int = 20
    run_timeout_seconds: int = 30
    cors_origins: list = ["http://localhost:5173", "http://localhost:4173"]


settings = Settings()
