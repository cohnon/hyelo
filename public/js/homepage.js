/*****************/
/* INTEREST TAGS */
let tags = [];
let tagsHTML = null;
let tagsInputHTML = null;
let randomJoinHTML = null;
let groupInputHTML = null;
let groupJoinHTML = null;
export function addTag(tag)
{
  if (!tagsHTML)
  {
    return;
  }
  tag = tag.trim();
  tag = tag.replace(/\s+/g,'-').toLowerCase();
  tag = tag.replace(/[^\w-]/g,'');
  if (tags.length > 10 || !tag || !tag.length || tag.length === 0)
  {
    return;
  }
  tags.push(tag);
  renderTags();
}
export function removeTag(index)
{
  if (index > -1 && index < tags.length);
  if (!tagsHTML)
  {
    return;
  }
  tags.splice(index, 1);
  renderTags();
}
export function clearTags()
{
  tags = [];
  renderTags();
}
function renderTags()
{
  while (tagsHTML.children.length > 1)
  {
    tagsHTML.removeChild(tagsHTML.firstChild);
  }
  tags.forEach((tag, index) => {
    const tagHTML = document.createElement('div');
    tagHTML.className = 'tag';
    tagHTML.innerHTML = tag;
    tagHTML.addEventListener('click', () => removeTag(index));
    tagsHTML.insertBefore(tagHTML, tagsInputHTML);
  });
}
export function load(app)
{
  tagsHTML = document.getElementById('tags');
  tagsInputHTML = document.getElementById('tags-input');
  randomJoinHTML = document.getElementById('random-button');
  groupInputHTML = document.getElementById('group-input');
  groupJoinHTML = document.getElementById('group-button');
  renderTags();
  tagsInputHTML.addEventListener('keydown', (e) =>{
    if (e.keyCode === 13)
    {
      addTag(e.target.value);
      e.target.value = '';
    }
  });
  randomJoinHTML.addEventListener('click', () => {
    app.commandManager.handle('rand', tags);
  });

  groupJoinHTML.addEventListener('click', () => {
    app.commandManager.handle('join', groupInputHTML.value);
  });
}


export function getTags()
{
  return tags;
}