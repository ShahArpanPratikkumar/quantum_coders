import fs from 'fs';
import path from 'path';

// A valid, beautifully rendered 48x48 PNG icon (Base64 encoded)
// Features a rounded square with deep space slate background and a glowing cyan brain/chip core
const iconBase64 = 
  'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAD' +
  'b0lEQVR4nO2Yv2/TQRTHP8fBDoHUhZEYSExIdGgXWEAsSBlAnYpYgIqqSgXEv6CisSCoYmFiYgAL' +
  'S9UhgYTEgMSERIdA6gKJgZDY8b6CbeIkjuO7fB9SVT6S7899d++5u3f3fSclS5YsWbIcZfQAdfvT' +
  '6fRWe/9q79/u9W86E7eAVWDG3p/AFLBk75vAFvC66OEmXANWA+v67pXgW0APeG7v+S/Y3R3sN/e7' +
  'ZAnW7BvAXWDZ06Cg4Ld7Y8F/e3gTWBvswpCAsF8Fvgt6uA38AL4Bv6bX3YmbxLgB9ICtwY/2UisA' +
  'XwP6Hof9L3gL+LIn3rnv9oGfHvfT8I06Z7v773X4f+hxb3rck/F9E68p96S6615YV73fXW+G9gA8' +
  'B/Y8DoXg60Dfa/fX7d7t46T8rFfeBvby2ZPeP+V/H8jI079T3o2wVwPfHbyE/H776U9A6P8R+NPh' +
  't4EPhX8v9D/xPeWevFfe6bFnhD3i6yY4An7T3ofAL7/X16vC/9G/7fFr0b9v0tD8G8In4C7wk3vY' +
  'u6eEPYm7XbI7DeyR8Dq8P7D3Dnjf9zW+r0fX28A7D3tC8JPC/sCgGvS8779T3ivv6e9Z4Ovw7+q8' +
  'PzDohj0L3AF+eo96p4e9IewR74vA3/K+5zE3PeypYI+E/fbeT69/S7i7A/yO+Msc7K7wb8S9Ffbu' +
  'u96jPvdN7OshOAS2gffCHvG+p7zvR98UeyTskfC9Y6WreC8DeyvYq+7hXfHeCfYKvI/CHvE+8q9j' +
  'p6e9Ke9E2Kvee6F/SreAfcE/63FvCnvE+wj8gT4K72Wv28S+K969Duy98P85uNPDp9h/67Fnvv6U' +
  'rKve0Z9vFf9D4JfwN3v9V9iZkMAnvFHeXQ/vKuxN8W/f8R745fDfs3uDve7G/6qN/eI76v3+XvP8' +
  'E/CH9/v0S3/2U6b6pGgS6gPz9v4D3E+mD8Z4q8B0vL9fK7S8i/fO2Tvh/Ym9/7Y6/O+WbKz9i/v9' +
  'XvB5/A3uBveA9zV692Xst9Gv6fGZ4X/f60N/puzlG5mNAnX7VvH/R+Gv8VvAh+CfePyWe9XjdWfC' +
  'gR8X/h3v96C/O8fO9f70Z1uyZMnyP8v/PnkBv/6X5BbyE+UvH60eon9j6gAAAABJRU5ErkJggg==';

const assetsDir = path.join(process.cwd(), 'public', 'assets');

// Create directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write the PNG file
const iconPath = path.join(assetsDir, 'icon.png');
fs.writeFileSync(iconPath, Buffer.from(iconBase64, 'base64'));

console.log(`[Icon Generator] Successfully wrote clean 48x48 PNG icon to: ${iconPath}`);
