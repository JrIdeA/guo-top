import { toPath, set, get } from 'lodash';

export function replaceChildNode(object, path, replacement) {
  const pathArr = toPath(path);

  let replacementNode = replacement;
  while (pathArr.length) {
    const currentKey = pathArr.pop();
    const nextParentNode = Object.assign({}, (pathArr.length ? get(object, pathArr) : object));
    set(nextParentNode, currentKey, replacementNode);
    replacementNode = nextParentNode;
  }
  return replacementNode;
}
