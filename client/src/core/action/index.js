export function createActionCreator(type) {
  return (payload) => ({
    type,
    payload,
  });
}