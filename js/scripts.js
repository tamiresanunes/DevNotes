// Elementos
// Container onde as notas são exibidas
const notesContainer = document.querySelector("#notes-container");

// Campo de entrada para o conteúdo da nota
const noteInput = document.querySelector("#note-content");

// Botão para adicionar uma nova nota
const addNoteBtn = document.querySelector(".add-note");

// Campo de entrada para busca de notas
const searchInput = document.querySelector("#search-input");

// Botão para exportar as notas
const exportBtn = document.querySelector("#export-notes");

// Funções

/**
 * Exibe todas as notas armazenadas, criando os elementos HTML correspondentes.
 */
function showNotes() {
  cleanNotes();

  getNotes().forEach((note) => {
    const noteElement = createNote(note.id, note.content, note.fixed);
    notesContainer.appendChild(noteElement);
  });
}

/**
 * Recupera as notas armazenadas no localStorage, ordenando por notas fixadas.
 * @returns {Array} Array de objetos representando as notas.
 */
function getNotes() {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");

  const orderedNotes = notes.sort((a, b) => (a.fixed > b.fixed ? -1 : 1));

  return orderedNotes;
}

/**
 * Limpa todas as notas exibidas na tela.
 */
function cleanNotes() {
  notesContainer.replaceChildren([]);
}

/**
 * Salva as notas no localStorage.
 * @param {Array} notes - Array de objetos representando as notas.
 */
function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

/**
 * Cria um elemento HTML representando uma nota, com seus botões de interação.
 * 
 * @param {number} id - ID da nota.
 * @param {string} content - Conteúdo da nota.
 * @param {boolean} fixed - Indicador se a nota está fixada.
 * @returns {HTMLElement} Elemento HTML representando a nota.
 */
function createNote(id, content, fixed) {
  const element = document.createElement("div");
  element.classList.add("note");

  const textarea = document.createElement("textarea");
  textarea.value = content;
  textarea.placeholder = "Adicione algum texto...";
  element.appendChild(textarea);

  if (fixed) {
    element.classList.add("fixed");
  }

  const pinIcon = document.createElement("i");
  pinIcon.classList.add(...["bi", "bi-pin"]);
  element.appendChild(pinIcon);

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add(...["bi", "bi-x-lg"]);
  element.appendChild(deleteIcon);

  const duplicateIcon = document.createElement("i");
  duplicateIcon.classList.add(...["bi", "bi-file-earmark-plus"]);
  element.appendChild(duplicateIcon);

  // Eventos do elemento
  element.querySelector("textarea").addEventListener("keydown", () => {
    const noteContent = element.querySelector("textarea").value;
    updateNote(id, noteContent);
  });

  element.querySelector(".bi-x-lg").addEventListener("click", () => {
    deleteNote(id, element);
  });

  element.querySelector(".bi-pin").addEventListener("click", () => {
    toggleFixNote(id);
  });

  element
    .querySelector(".bi-file-earmark-plus")
    .addEventListener("click", () => {
      copyNote(id);
    });

  return element;
}

/**
 * Adiciona uma nova nota à lista de notas e a exibe na tela.
 */
function addNote() {
  const notes = getNotes();

  const noteInput = document.querySelector("#note-content");

  const noteObject = {
    id: generateId(),
    content: noteInput.value,
    fixed: false,
  };

  const noteElement = createNote(noteObject.id, noteObject.content);

  notesContainer.appendChild(noteElement);

  notes.push(noteObject);

  saveNotes(notes);
}

/**
 * Gera um ID único para uma nova nota.
 * @returns {number} ID gerado.
 */
function generateId() {
  return Math.floor(Math.random() * 5000);
}

/**
 * Atualiza o conteúdo de uma nota específica.
 * 
 * @param {number} id - ID da nota a ser atualizada.
 * @param {string} newContent - Novo conteúdo da nota.
 */
function updateNote(id, newContent) {
  const notes = getNotes();
  const targetNote = notes.filter((note) => note.id === id)[0];

  targetNote.content = newContent;

  saveNotes(notes);
}

/**
 * Remove uma nota da lista e a exclui da tela.
 * 
 * @param {number} id - ID da nota a ser excluída.
 * @param {HTMLElement} element - Elemento HTML correspondente à nota.
 */
function deleteNote(id, element) {
  const notes = getNotes().filter((note) => note.id !== id);

  saveNotes(notes);

  notesContainer.removeChild(element);
}

/**
 * Alterna o status de fixação de uma nota.
 * 
 * @param {number} id - ID da nota a ser fixada ou desfixada.
 */
function toggleFixNote(id) {
  const notes = getNotes();
  const targetNote = notes.filter((note) => note.id === id)[0];

  targetNote.fixed = !targetNote.fixed;

  saveNotes(notes);

  showNotes();
}

/**
 * Busca e exibe notas com base em um termo de busca.
 * 
 * @param {string} search - Termo de busca a ser utilizado.
 */
function searchNotes(search) {
  const searchResults = getNotes().filter((note) =>
    note.content.includes(search)
  );

  if (search !== "") {
    cleanNotes();

    searchResults.forEach((note) => {
      const noteElement = createNote(note.id, note.content);
      notesContainer.appendChild(noteElement);
    });

    return;
  }

  cleanNotes();

  showNotes();
}

/**
 * Cria uma cópia de uma nota e a adiciona à lista de notas.
 * 
 * @param {number} id - ID da nota a ser copiada.
 */
function copyNote(id) {
  const notes = getNotes();
  const targetNote = notes.filter((note) => note.id === id)[0];

  const noteObject = {
    id: generateId(),
    content: targetNote.content,
    fixed: false,
  };

  const noteElement = createNote(noteObject.id, noteObject.content, false);

  notesContainer.appendChild(noteElement);

  notes.push(noteObject);

  saveNotes(notes);
}

/**
 * Exporta todas as notas para um arquivo CSV.
 */
function exportData() {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");

  const csvString = [
    ["ID", "Conteúdo", "Fixado?"],
    ...notes.map((note) => [note.id, note.content, note.fixed]),
  ]
    .map((e) => e.join(","))
    .join("\n");

  const element = document.createElement("a");
  element.href = "data:text/csv;charset=utf-8," + encodeURI(csvString);
  element.target = "_blank";
  element.download = "export.csv";

  element.click();
}

// Eventos

// Adiciona uma nova nota ao clicar no botão
addNoteBtn.addEventListener("click", () => addNote());

// Filtra as notas enquanto o usuário digita no campo de busca
searchInput.addEventListener("keyup", (e) => {
  const search = e.target.value;
  searchNotes(search);
});

// Adiciona uma nova nota ao pressionar "Enter" no campo de entrada
noteInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addNote();
  }
});

// Exporta as notas ao clicar no botão de exportação
exportBtn.addEventListener("click", () => {
  exportData();
});

// Init

// Exibe todas as notas ao carregar a página
showNotes();

