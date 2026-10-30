Add-Type -AssemblyName System.Drawing

function New-Icon([int]$size, [string]$path) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::FromArgb(255, 255, 240, 245))

  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle 0, 0, $size, $size),
    [System.Drawing.Color]::FromArgb(255, 255, 240, 245),
    [System.Drawing.Color]::FromArgb(255, 251, 113, 133),
    45.0
  )
  $g.FillRectangle($brush, 0, 0, $size, $size)

  $pad = [int]($size * 0.18)
  $w = $size - (2 * $pad)
  $h = [int]($w * 1.12)
  $x = $pad
  $y = [int](($size - $h) / 2)

  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 255, 255, 255))
  $pink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 251, 113, 133))
  $rose = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 225, 29, 72))
  $screen = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 241, 245))

  $radius = [Math]::Max(8, [int]($w * 0.14))
  $pathBody = New-Object System.Drawing.Drawing2D.GraphicsPath
  $pathBody.AddArc($x, $y, $radius, $radius, 180, 90)
  $pathBody.AddArc($x + $w - $radius, $y, $radius, $radius, 270, 90)
  $pathBody.AddArc($x + $w - $radius, $y + $h - $radius, $radius, $radius, 0, 90)
  $pathBody.AddArc($x, $y + $h - $radius, $radius, $radius, 90, 90)
  $pathBody.CloseFigure()
  $g.FillPath($white, $pathBody)

  $sx = $x + [int]($w * 0.12)
  $sy = $y + [int]($h * 0.1)
  $sw = [int]($w * 0.76)
  $sh = [int]($h * 0.2)
  $g.FillRectangle($screen, $sx, $sy, $sw, $sh)

  $r = [Math]::Max(4, [int]($w * 0.055))
  for ($row = 0; $row -le 2; $row++) {
    for ($col = 0; $col -le 2; $col++) {
      if ($row -eq 2 -and $col -eq 2) { continue }
      $cx = $sx + [int]($sw * (0.18 + $col * 0.32))
      $cy = $sy + $sh + [int]($h * (0.16 + $row * 0.18))
      $dot = if ($col -eq 2) { $rose } else { $pink }
      $g.FillEllipse($dot, $cx - $r, $cy - $r, $r * 2, $r * 2)
    }
  }

  $eqX = $sx + [int]($sw * 0.42)
  $eqY = $sy + $sh + [int]($h * 0.48)
  $eqW = [int]($sw * 0.46)
  $eqH = [Math]::Max(6, [int]($h * 0.08))
  $g.FillRectangle($rose, $eqX, $eqY, $eqW, $eqH)

  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  $brush.Dispose()
  $white.Dispose()
  $pink.Dispose()
  $rose.Dispose()
  $screen.Dispose()
}

New-Item -ItemType Directory -Force -Path "public/icons" | Out-Null
New-Icon 192 "public/icons/icon-192.png"
New-Icon 512 "public/icons/icon-512.png"
New-Icon 180 "public/icons/apple-touch-icon.png"
Write-Output "icons created"
Get-ChildItem public/icons | ForEach-Object { "$($_.Name) $($_.Length)" }
