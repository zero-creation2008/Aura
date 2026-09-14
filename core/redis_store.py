"""Optional Redis adapter for cross-process events/cache; no secret is exposed."""
import config

def client():
    if not config.REDIS_URL: return None
    try:
        import redis
        return redis.Redis.from_url(config.REDIS_URL, decode_responses=True, socket_connect_timeout=2)
    except ImportError as exc: raise RuntimeError("REDIS_URL requires redis dependency") from exc
def healthcheck():
    instance=client()
    if instance is None: return {"configured":False,"ok":True}
    try: instance.ping(); return {"configured":True,"ok":True}
    except Exception as exc: return {"configured":True,"ok":False,"error":str(exc)}
