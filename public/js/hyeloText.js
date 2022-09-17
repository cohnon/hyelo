/**
 * Simple custom markdown renderer for Hyelo
 */

export function renderText(text)
{
  text = text || "Someone";
  return text
  .replace(/</g, "&lt;") // <
  .replace(/>/g, "&gt;") // >
  .replace(/```([^\n]*)\n([^`]*)```/, '<div class="billboard $1">$2</div>')
  .replace(/(http|https):\/\/(\S*)/, '<a href=$1://$2>$1://$2</a>')
  .replace(/(?:^|[^\S])\?([^\s]*)/, '<a href="?$1">?$1</div>')
  .replace(/\n/g, '<br>')
}

function isURL(str) {
  const urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
  const url = new RegExp(urlRegex, 'i');
  return str.length < 2083 && url.test(str);
}

export function renderTime(time)
{
  const date = new Date(time);
  const hours = numString(date.getHours());
  const minutes = numString(date.getMinutes());
  const seconds = numString(date.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

function numString(value)
{
  if (value < 10)
  {
    return `0${value}`;
  }
  return `${value}`;
}
