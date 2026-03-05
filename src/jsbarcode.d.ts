declare module 'jsbarcode' {
  interface JsBarcodeOptions {
    format?: string
    width?: number
    height?: number
    displayValue?: boolean
    lineColor?: string
    background?: string
    margin?: number
    fontSize?: number
    [key: string]: unknown
  }
  function JsBarcode(
    target: string | HTMLCanvasElement | SVGElement | HTMLImageElement,
    value: string,
    options?: JsBarcodeOptions
  ): void
  export default JsBarcode
}
