// Variável para armazenar o gráfico globalmente
let grafico;

// Inicializando o formulário de adição de frutas
document.getElementById('form-fruta').addEventListener('submit', function (event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const quantidade = document.getElementById('quantidade').value;

    if (!nome || quantidade <= 0) {
        alert("Por favor, insira um nome válido e uma quantidade maior que zero.");
        return;
    }

    adicionarFrutaAoEstoque(nome, quantidade);
    salvarEstoqueNoLocalStorage();
    document.getElementById('nome').value = '';
    document.getElementById('quantidade').value = '';
});

// Função para adicionar uma fruta ao estoque
function adicionarFrutaAoEstoque(nome, quantidade) {
    const listaEstoque = document.getElementById('lista-estoque');

    const li = document.createElement('li');
    li.innerHTML = `
        <span>${nome} - Quantidade: ${quantidade}</span>
        <button class="btn-editar">Editar</button>
        <button class="btn-remover">Remover</button>
    `;

    // Função para remover frutas
    li.querySelector('.btn-remover').addEventListener('click', function () {
        listaEstoque.removeChild(li);
        salvarEstoqueNoLocalStorage();
        atualizarGrafico();
    });

    // Função para editar frutas
    li.querySelector('.btn-editar').addEventListener('click', function () {
        const novoNome = prompt("Editar nome da fruta:", nome);
        const novaQuantidade = prompt("Editar quantidade:", quantidade);

        if (novoNome && novaQuantidade) {
            li.querySelector('span').textContent = `${novoNome} - Quantidade: ${novaQuantidade}`;
            salvarEstoqueNoLocalStorage();
            atualizarGrafico();
        }
    });

    listaEstoque.appendChild(li);
    atualizarGrafico();
    registrarHistorico('Adicionada', nome, quantidade);
}

// Função para atualizar o gráfico de estoque
function atualizarGrafico() {
    const listaFrutas = [];
    const listaQuantidades = [];
    const items = document.querySelectorAll('#lista-estoque li span');

    items.forEach(item => {
        const [fruta, quantidade] = item.textContent.split(' - Quantidade: ');
        listaFrutas.push(fruta);
        listaQuantidades.push(parseInt(quantidade));
    });

    // Verificar se o gráfico já existe
    if (grafico) {
        grafico.destroy(); // Destruir o gráfico anterior antes de criar um novo
    }

    const ctx = document.getElementById('graficoEstoque').getContext('2d');
    grafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: listaFrutas,
            datasets: [{
                label: 'Quantidade em Estoque',
                data: listaQuantidades,
                backgroundColor: ['#f39c12', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6']
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Função para filtrar frutas no estoque
document.getElementById('pesquisa').addEventListener('input', function() {
    const filtro = this.value.toLowerCase();
    const frutas = document.querySelectorAll('#lista-estoque li');

    frutas.forEach(function(fruta) {
        const texto = fruta.textContent.toLowerCase();
        fruta.style.display = texto.includes(filtro) ? '' : 'none';
    });
});

// Função para registrar movimentações no histórico
function registrarHistorico(acao, fruta, quantidade) {
    const historico = document.getElementById('historico-estoque');
    const item = document.createElement('li');
    const data = new Date().toLocaleString();
    item.textContent = `${data}: ${acao} - ${fruta} (${quantidade})`;
    historico.appendChild(item);
}

// Função para exportar estoque para CSV
function exportarCSV() {
    const linhas = [];
    const frutas = document.querySelectorAll('#lista-estoque li span');
    frutas.forEach(item => linhas.push(item.textContent));

    const csvContent = "data:text/csv;charset=utf-8," + linhas.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "estoque_de_frutas.csv");
    document.body.appendChild(link);
    link.click();
}

// Função para salvar o estoque no LocalStorage
function salvarEstoqueNoLocalStorage() {
    const frutas = [];
    document.querySelectorAll('#lista-estoque li span').forEach(item => frutas.push(item.textContent));
    localStorage.setItem('estoqueFrutas', JSON.stringify(frutas));
}

// Função para carregar o estoque do LocalStorage
function carregarEstoqueDoLocalStorage() {
    const frutas = JSON.parse(localStorage.getItem('estoqueFrutas'));
    if (frutas) {
        frutas.forEach(item => {
            const [nome, quantidade] = item.split(' - Quantidade: ');
            adicionarFrutaAoEstoque(nome, quantidade);
        });
    }
}

// Carregar o estoque ao iniciar a página
window.onload = carregarEstoqueDoLocalStorage;
