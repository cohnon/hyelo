const themeHTML = document.getElementById('theme');
const themeSelectHTML = document.getElementById('theme-select');
const themes = ['light', 'dark', 'contrast'];
const nickInputHTML = document.getElementById('nick-input');

export function loadSidebar(app)
{
  const currentTheme = localStorage.getItem('theme') || themes[0];
  themeHTML.href = `themes/${currentTheme}.css`;
  themes.forEach((theme) => {
    const newOption = document.createElement('option');
    newOption.innerHTML = theme;
    newOption.value = theme;
    themeSelectHTML.appendChild(newOption);
  });
  themeSelectHTML.value = currentTheme;

  themeSelectHTML.onchange = (e) => {
    updateTheme(e.target.value);
  }

  nickInputHTML.addEventListener('blur', () => {
    app.commandManager.handle('nick', nickInputHTML.value);
  });
}

export function updateNick(nick)
{
  nickInputHTML.value = nick;
}

export function updateTheme(theme)
{
  console.log(theme)
  if (themes.indexOf(theme) !== -1)
  {
    localStorage.setItem('theme',theme);
    themeHTML.href = `themes/${theme}.css`;
  }
}

export function updateRoomInfo(room_id)
{

}