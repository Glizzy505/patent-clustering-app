const attachment = {
  keywords: [
    "electronic",
    "device",
    "method",
    "controlling",
    "ambient",
    "light",
    "sensor",
  ],
  cluster: "Wearable Technology",
  cluster_id: 2,
  year: 2018,
  country: "KR",
  similarity_vector: [0.34, 0.78, 0.56, 0.12, 0.45],
};

export const updatedData = (data) =>
  data.map((item) => {
    if (item.No > 20) {
      return { ...item, ...attachment };
    }
    return item;
  });
