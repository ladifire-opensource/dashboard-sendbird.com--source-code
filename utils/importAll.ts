export const importAll = <T = any>(context: ReturnType<typeof require['context']>) => {
  return context.keys().reduce((result, item) => {
    result[item.replace('./', '')] = context(item);
    return result;
  }, {} as Record<string, T>);
};
