import OpenAI from 'openai';

import { getServerConfig } from '@/config/server';
import { getOpenAIAuthFromRequest } from '@/const/fetch';
import { ErrorType } from '@/types/fetch';
import { OpenAIStreamPayload } from '@/types/openai';

import { checkAuth } from '../../auth';
import { createAzureOpenai } from '../createAzureOpenai';
import { createChatCompletion } from '../createChatCompletion';
import { createOpenai } from '../createOpenai';
import { createErrorResponse } from '../errorResponse';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  const payload = (await req.json()) as OpenAIStreamPayload;

  const { apiKey, accessCode, endpoint, useAzure, apiVersion } = getOpenAIAuthFromRequest(req);

  const result = checkAuth({ accessCode, apiKey });

  if (!result.auth) {
    return createErrorResponse(result.error as ErrorType);
  }

  let openai: OpenAI;

  const { USE_AZURE_OPENAI } = getServerConfig();
  const useAzureOpenAI = useAzure || USE_AZURE_OPENAI;

  if (useAzureOpenAI) {
    openai = createAzureOpenai({ apiVersion, endpoint, model: payload.model, userApiKey: apiKey });
  } else {
    openai = createOpenai(apiKey, endpoint);
  }

  return createChatCompletion({ openai, payload });
};
