import {
  env,
  pipeline,
} from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.5.0";
import generateEmbedding from "./embedding.ts";
import similarity from "./similarity.ts";

env.useBrowserCache = false;
env.allowLocalModels = false;

const pipe = await pipeline(
  "feature-extraction",
  "koxy-ai/gte-small",
);

const data = [
  { id: 0, value: "Hello World" },
  { id: 1, value: "How are you doing?" },
  { id: 2, value: "They went to the park together" },
  { id: 3, value: "The quick brown fox jumps over the lazy dog" },
  { id: 4, value: "The horse is red" },
  { id: 5, value: "The mouse is black" },
  { id: 6, value: "The cat is white" },
  { id: 7, value: "The dog is brown" },
  { id: 8, value: "The fox is green" },
  { id: 9, value: "The bird is yellow" },
  { id: 10, value: "Kais is my name" },
  { id: 11, value: "London is the capital of Great Britain" },
  { id: 12, value: "We went to the park" },
  { id: 13, value: "The quick brown fox jumps over the lazy dog" },
  { id: 14, value: "The horse is red" },
  { id: 15, value: "The mouse is black" },
  { id: 16, value: "The cat is white" },
  { id: 17, value: "The dog is brown" },
  { id: 18, value: "The fox is green" },
  { id: 19, value: "The bird is yellow" },
  { id: 20, value: "Kais is my name" },
  { id: 21, value: "London is the capital of Great Britain" },
  { id: 22, value: "We went to the park" },
];

async function mapData(data: string[]) {
  const embeddings = [];
  for (const item of data) {
    const embedding = await generateEmbedding(item.value);
    embeddings.push({ embedding, id: item.id });
  }
  return embeddings;
}

const embeddings = await mapData(data);

const mainInput = "place";
const mainEmbedding = await generateEmbedding(mainInput);

const simialities = similarity(embeddings, mainEmbedding);

const sortedData = [];

simialities.map((similarity) => {
  sortedData.push(data[similarity.index]);
});

console.log(sortedData);

export default pipe;
