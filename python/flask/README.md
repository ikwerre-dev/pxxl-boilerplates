# Flask

Flask API served by Gunicorn.

## Deploy on Pxxl

Select `python/flask` as the base directory. Pxxl detects **python / flask** from the committed project files. The health check is available at `/health`.

```text
Type: api
Runtime: python
Port: 8000
```
