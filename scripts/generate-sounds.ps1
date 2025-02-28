# List of sound files
$soundFiles = @(
    "aaajaijaij.wav",
    "aha.wav",
    "ahaha.wav",
    "aivittu.wav",
    "ajajaväärinpäin.wav",
    "aklla.wav",
    "aklla132222.wav",
    "ammuinlipallisen.wav",
    "ammukytäöt.wav",
    "anteeksm itä.wav",
    "antekeksitiät.wav",
    "arghh222.wav",
    "arghhhhhhh.wav",
    "asiavilipitänm.wav",
    "askelista.wav",
    "awikalla.wav",
    "awikalla2222.wav",
    "bastirol.wav",
    "battarväärinpäin.wav",
    "chacha.wav",
    "chat-is-my-family-vorhala.mp3",
    "chatti.wav",
    "chatti2.wav",
    "dippi1.wav",
    "dippi2.wav",
    "dippidipipi.wav",
    "dontwörm,mymisteiks.wav",
    "eiii.wav",
    "enkuule.wav",
    "etukkaaaasdadsads.wav",
    "fibi-paikalle-vorhala.mp3",
    "frozenteltta.wav",
    "föösppööösön.wav",
    "hakkeri.wav",
    "halleluja.wav",
    "hannuhanhentuuri.wav",
    "heihei.wav",
    "helekatinpässikusipaa.wav",
    "helevetinpässi.wav",
    "hienostiethtyh.wav",
    "huumorituulella.wav",
    "hyvätsnikpet.wav",
    "hönönauru.wav",
    "ipi.mp4"
)

# Create sounds directory if it doesn't exist
$soundsDir = "public/sounds"
if (-not (Test-Path $soundsDir)) {
    New-Item -ItemType Directory -Path $soundsDir | Out-Null
}

# Function to create a placeholder WAV file
function Create-PlaceholderWav {
    param (
        [string]$filename
    )
    
    $extension = [System.IO.Path]::GetExtension($filename).ToLower()
    $fullPath = Join-Path $soundsDir $filename
    
    # Create an empty file with the correct extension
    if ($extension -eq ".wav") {
        # Create a minimal WAV file (44 bytes header + 1 second of silence)
        $bytes = [byte[]]@(
            # RIFF header
            0x52, 0x49, 0x46, 0x46,  # "RIFF"
            0x24, 0x00, 0x00, 0x00,  # Chunk size (36 bytes)
            0x57, 0x41, 0x56, 0x45,  # "WAVE"
            # fmt chunk
            0x66, 0x6D, 0x74, 0x20,  # "fmt "
            0x10, 0x00, 0x00, 0x00,  # Chunk size (16 bytes)
            0x01, 0x00,              # Audio format (1 = PCM)
            0x01, 0x00,              # Number of channels (1)
            0x44, 0xAC, 0x00, 0x00,  # Sample rate (44100 Hz)
            0x44, 0xAC, 0x00, 0x00,  # Byte rate
            0x01, 0x00,              # Block align
            0x08, 0x00,              # Bits per sample (8)
            # data chunk
            0x64, 0x61, 0x74, 0x61,  # "data"
            0x00, 0x00, 0x00, 0x00   # Chunk size (0 bytes)
        )
        [System.IO.File]::WriteAllBytes($fullPath, $bytes)
    }
    elseif ($extension -eq ".mp3") {
        # Create an empty MP3 file
        [System.IO.File]::WriteAllBytes($fullPath, [byte[]]@(
            0xFF, 0xFB, 0x90, 0x64, 0x00  # Basic MP3 header
        ))
    }
    elseif ($extension -eq ".mp4") {
        # Create an empty MP4 file
        [System.IO.File]::WriteAllBytes($fullPath, [byte[]]@(
            0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70  # Basic MP4 header
        ))
    }
    
    Write-Host "Created placeholder file: $filename"
}

# Create placeholder files for each sound
foreach ($file in $soundFiles) {
    Create-PlaceholderWav $file
}

Write-Host "Done! Created $(($soundFiles).Count) placeholder sound files in $soundsDir" 