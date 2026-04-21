export const usePageState = () => {
  const pagesId = useState<number | null>("pages-id", () => null);
  return { pagesId };
};
