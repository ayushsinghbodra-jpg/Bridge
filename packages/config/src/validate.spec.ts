import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import { validateEnv } from './validate';
describe('Valiidate Env Variables',()=>{
  it('should check if the env variables are valid or not ',()=>{
    const schema = z.object({
      PORT : z.number().int().positive(),
      API_KEY : z.string().min(5)
    });
    const result = validateEnv(schema, { PORT: 3000, API_KEY: 'abcde' });
    expect(result).toEqual({ PORT: 3000, API_KEY: 'abcde' });
  });
  it('should throw an error if the env variables are invalid',()=>{
    const schema = z.object({
      PORT : z.number().int().positive(),
      API_KEY : z.string().min(5)
    });
    expect(() => validateEnv(schema, { PORT: -1, API_KEY: 'abc' })).toThrow('Environment validation failed');
  });
})