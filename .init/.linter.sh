#!/bin/bash
cd /home/kavia/workspace/code-generation/weather-search-viewer-40750-40759/weather_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

