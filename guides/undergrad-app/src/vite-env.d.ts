/// <reference types="vite/client" />

declare module '*.sh?raw' {
  const content: string
  export default content
}

declare module '*.py?raw' {
  const content: string
  export default content
}

declare module '*.png' {
  const src: string
  export default src
}
