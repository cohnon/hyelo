const themeHTML = document.getElementById('theme');
const themeSelectHTML = document.getElementById('theme-select');
const themes = ['light', 'dark', 'contrast'];
const changeNickHTML = document.getElementById('change-nick');
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
    localStorage.setItem('theme', e.target.value);
    themeHTML.href = `themes/${e.target.value}.css`
  }

  
  changeNickHTML.addEventListener('click', () => {
    app.commandManager.handle('nick', nickInputHTML.value);
  });
}

export function updateNick(nick)
{
  nickInputHTML.value += nick;
}

export function updateRoomInfo(room_id)
{

}