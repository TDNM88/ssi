mport axios from "axios";

const KV_REST_API_URL = process.env.KV_REST_API_URL!;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN!;

export async function kvSet(key: string, value: string) {
  return axios.post(
    `${KV_REST_API_URL}/set/${key}`,
    value,
    {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    }
  );
}

export async function kvGet(key: string) {
  const res = await axios.get(
    `${KV_REST_API_URL}/get/${key}`,
    {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    }
  );
  return res.data.result;
}
