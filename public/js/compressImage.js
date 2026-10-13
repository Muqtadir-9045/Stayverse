// Shrinks the chosen photo in the browser before upload, so a 5 MB phone
// photo becomes ~300 KB. If anything fails, the original file is kept.
(() => {
  'use strict'

  const MAX_WIDTH = 1600
  const QUALITY = 0.8
  const MIN_SIZE = 500 * 1024 // small files are uploaded as they are

  const compress = (file) => new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.size < MIN_SIZE) return resolve(file)

    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, MAX_WIDTH / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff' // transparent PNGs would otherwise turn black
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (!blob || blob.size >= file.size) return resolve(file)
        const name = file.name.replace(/\.\w+$/, '') + '.jpg'
        resolve(new File([blob], name, { type: 'image/jpeg' }))
      }, 'image/jpeg', QUALITY)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }
    img.src = url
  })

  document.querySelectorAll('input[type="file"][data-compress]').forEach(input => {
    input.addEventListener('change', async () => {
      const file = input.files[0]
      if (!file) return
      const buttons = input.form.querySelectorAll('button')
      buttons.forEach(b => { b.disabled = true })
      try {
        const smaller = await compress(file)
        if (smaller !== file) {
          const dt = new DataTransfer()
          dt.items.add(smaller)
          input.files = dt.files
        }
      } finally {
        buttons.forEach(b => { b.disabled = false })
      }
    })
  })
})()
