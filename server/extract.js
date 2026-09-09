import fs from 'fs'
import path from 'path'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'

export async function extractText(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase()
  const buf = fs.readFileSync(filePath)

  if (['.txt', '.md', '.csv', '.tsv', '.json', '.srt', '.vtt'].includes(ext)) {
    return buf.toString('utf8')
  }

  if (ext === '.pdf') {
    const data = await pdf(buf)
    return data.text || ''
  }

  if (ext === '.docx') {
    const res = await mammoth.extractRawText({ buffer: buf })
    return res.value || ''
  }

  if (ext === '.doc') {
    throw new Error('Legacy .doc is not supported — please convert to .docx or .txt.')
  }

  if (ext === '.pptx' || ext === '.ppt') {
    throw new Error('Presentation files are not directly parsed — please paste the slide text or a transcript instead.')
  }

  if (['.mp4', '.mov', '.avi', '.mp3', '.wav'].includes(ext)) {
    throw new Error('Audio/video files need a transcript — please upload the transcript as .txt/.srt/.vtt.')
  }

  throw new Error(`Unsupported file type "${ext}". Use .pdf, .docx, .txt, .md, or .csv.`)
}
