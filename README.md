# sub2vtt v2.0

This version of `sub2vtt` has been specifically adapted and enhanced for the [gestdown-subtitles](https://github.com/Dydhzo/gestdown-subtitles) Stremio addon, with a focus on providing robust, language-aware character encoding conversion.

The modifications make it ideal for this project and potentially for future multi-language subtitle applications.

## Key Features

- **Intelligent Encoding Conversion:** Automatically converts legacy (non-UTF-8) subtitle files to UTF-8, ensuring special characters and accents are displayed correctly.
- **Language-Aware:** Uses the language of the subtitle as a hint to select the correct legacy character encoding (e.g., `windows-1251` for Russian, `windows-1253` for Greek).
- **Comprehensive Language Support:** Includes a mapping for 77 different languages to their most common legacy encodings.
- **Handles Archives:** Extracts subtitles from `.zip` and `.rar` archives on the fly.
- **Express Middleware:** Provides a simple middleware for easy integration into any Express.js-based addon.

## How It Works

The library uses a hybrid approach for maximum accuracy:
1.  It first attempts to detect if the file is already in a Unicode format (UTF-8 or UTF-16). If so, it uses it directly.
2.  If the file is a legacy (non-Unicode) format, or if the detection confidence is low, it uses an extensive internal map to look up the most likely legacy encoding based on the provided language code.
3.  This ensures that subtitles for languages like French, Russian, Greek, Turkish, etc., are all decoded correctly before being converted to the final VTT format.

## Credits

This project builds upon the original work of **dexter21767's sub2vtt**. The original repository can be found at: https://github.com/dexter21767/sub2vtt
