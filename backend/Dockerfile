# Oyedesi FastAPI — AWS Lambda container image
# Build context: backend/  (directory containing this file)
# Handler: lambda_handler.handler

FROM public.ecr.aws/lambda/python:3.12

WORKDIR ${LAMBDA_TASK_ROOT}

# Install dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Application code (never copy .env — use Lambda environment variables)
COPY app ./app
COPY lambda_handler.py .

CMD ["lambda_handler.handler"]
