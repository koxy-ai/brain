import { env, pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.5.0";

env.useBrowserCache = false;
env.allowLocalModels = false;

const pipe = await pipeline(
    "feature-extraction",
    "koxy-ai/gte-small"
);

const output = await pipe('Hello world', {
    pooling: 'mean',
    normalize: true,
});

const embedding = Array.from(output.data);

console.log(embedding);