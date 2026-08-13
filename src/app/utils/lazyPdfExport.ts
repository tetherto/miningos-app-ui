/**
 * Lazy-loaded PDF export utilities
 * This module dynamically imports jsPDF and html2canvas only when needed
 * Saves ~165KB from initial bundle
 */

import type * as htmlToImage from 'html-to-image'
import type html2canvas from 'html2canvas'
import type jsPDF from 'jspdf'

let pdfLib: typeof jsPDF | null = null
let htmlToImageLib: typeof htmlToImage | null = null
let html2canvasLib: typeof html2canvas | null = null

/**
 * Dynamically load jsPDF library
 * @returns {Promise<typeof import('jspdf').default>}
 */
export const loadJsPDF = async (): Promise<typeof jsPDF> => {
  if (!pdfLib) {
    const module = await import('jspdf')
    pdfLib = module.default
  }
  return pdfLib
}

/**
 * Dynamically load html-to-image library
 * @returns {Promise<typeof import('html-to-image')>}
 */
export const loadHtmlToImage = async (): Promise<typeof htmlToImage> => {
  if (!htmlToImageLib) {
    htmlToImageLib = await import('html-to-image')
  }
  return htmlToImageLib
}

/**
 * Dynamically load html2canvas library
 * @returns {Promise<typeof import('html2canvas').default>}
 */
export const loadHtml2Canvas = async (): Promise<typeof html2canvas> => {
  if (!html2canvasLib) {
    const module = await import('html2canvas')
    html2canvasLib = module.default
  }
  return html2canvasLib
}
