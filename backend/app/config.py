from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    alchemy_api_key: str = ""
    coingecko_api_key: str = ""
    the_graph_api_key: str = ""
    dune_api_key: str = ""
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
