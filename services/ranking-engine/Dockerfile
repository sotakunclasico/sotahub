FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONUTF8=1

WORKDIR /app

COPY services/ranking-engine/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY services/ranking-engine/app ./app
COPY scripts/community-ranking/community_ranking.py ./scanner/community_ranking.py

RUN useradd --create-home --uid 10001 ranking \
    && chown -R ranking:ranking /app

USER ranking

EXPOSE 10000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
