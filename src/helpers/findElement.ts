import React from 'react'

export const findElement = <T>(
  node: React.ReactNode,
  element: React.JSXElementConstructor<T>
): React.ReactElement<T> | null => {
  if (Array.isArray(node)) {
    return node.find((el) => !!findElement(el, element))
  }

  if (React.isValidElement(node)) {
    if (node.type === element) {
      return node as React.ReactElement<T>
    }

    if (node.props.children) {
      return findElement(node.props.children, element)
    }
  }

  return null
}
