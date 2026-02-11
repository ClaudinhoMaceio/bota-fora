// ========================================================
// SISTEMA DE BOTA FORA - M.A VIANA LOCAÇÕES
// VERSÃO 1.0 - Sistema Independente
// ========================================================

// Variáveis globais
let clearances = [];

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema de Bota Fora...');
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Carregar dados salvos (clearances e campos do formulário)
    carregarClearances();
    carregarDadosFormulario();
    
    // Configurar salvamento automático de todos os campos
    configurarSalvamentoAutomatico();
    
    // Atualizar interface
    atualizarInterface();
    
    // Atualizar resumo
    atualizarResumo();
    
    console.log('✅ Sistema de Bota Fora inicializado com sucesso!');
});

// Configurar todos os event listeners
function configurarEventListeners() {
    // Botão adicionar clearance
    const btnAdicionarClearance = document.getElementById('adicionar-clearance');
    if (btnAdicionarClearance) {
        btnAdicionarClearance.addEventListener('click', adicionarLinhaClearance);
    }
    
    // Botão exportar PDF
    const btnExportarPDF = document.getElementById('exportar-pdf-bota-fora');
    if (btnExportarPDF) {
        btnExportarPDF.addEventListener('click', exportarPDFBotaFora);
    }
    
    // Botão limpar dados
    const btnLimpar = document.getElementById('limpar-bota-fora');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', limparBotaFora);
    }
    
    // Upload de imagem para reconhecer datas
    const uploadImagem = document.getElementById('upload-imagem-datas');
    if (uploadImagem) {
        uploadImagem.addEventListener('change', processarImagemOCR);
    }
    
    // Configurar modo noturno
    configurarModoNoturno();
}

// Configurar modo noturno
function configurarModoNoturno() {
    const btnToggleDarkMode = document.getElementById('toggle-dark-mode');
    if (!btnToggleDarkMode) return;
    
    // Carregar preferência salva
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        atualizarIconeModoNoturno(true);
    }
    
    // Event listener para alternar modo
    btnToggleDarkMode.addEventListener('click', function() {
        const temaAtual = document.documentElement.getAttribute('data-theme');
        const isDark = temaAtual === 'dark';
        
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('tema', 'light');
            atualizarIconeModoNoturno(false);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('tema', 'dark');
            atualizarIconeModoNoturno(true);
        }
    });
}

// Atualizar ícone do modo noturno
function atualizarIconeModoNoturno(isDark) {
    const btnToggleDarkMode = document.getElementById('toggle-dark-mode');
    if (!btnToggleDarkMode) return;
    
    const icon = btnToggleDarkMode.querySelector('i');
    if (icon) {
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

// Funções removidas - agora o usuário digita a data manualmente sem interferência

// Adicionar linha de Bota Fora - SEM INTERVENÇÃO, permite qualquer data e quantidade
function adicionarLinhaClearance() {
    const clearance = {
        id: Date.now() + Math.random(), // ID único baseado em timestamp + random para evitar duplicatas
        qtdViagens: 0, // Permite começar com 0 ou qualquer valor
        valorViagem: 0,
        data: '', // Campo vazio - usuário digita manualmente
        observacao: '',
        total: 0
    };
    
    // Adicionar no final do array - SEM ORDENAÇÃO
    clearances.push(clearance);
    atualizarTabelaClearance();
    salvarClearances();
    atualizarResumo();
    mostrarNotificacao('Linha de Bota Fora adicionada! Digite a data manualmente.', 'success');
}

// Remover linha de Bota Fora
function removerLinhaClearance(id) {
    if (confirm('Tem certeza que deseja remover esta linha?')) {
        clearances = clearances.filter(c => c.id !== id);
        atualizarTabelaClearance();
        salvarClearances();
        atualizarResumo();
        mostrarNotificacao('Linha removida com sucesso!', 'success');
    }
}

// Atualizar tabela de Bota Fora - SEM ORDENAÇÃO, mantém ordem de inserção
function atualizarTabelaClearance() {
    const tbody = document.getElementById('tabela-clearance-body');
    const totalQuantidade = document.getElementById('total-quantidade-clearance');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (clearances.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="6" style="text-align: center; padding: 20px; color: #999;">
                Nenhum Bota Fora adicionado. Clique em "Adicionar Data e Quantidade" para começar.
            </td>
        `;
        tbody.appendChild(tr);
    } else {
        // IMPORTANTE: NÃO ORDENAR - manter ordem de inserção exata
        // Permite datas em qualquer ordem: dia 20 antes, dia 1 depois, etc.
        clearances.forEach((clearance, index) => {
            // Calcular total para esta linha
            const qtdViagens = parseFloat(clearance.qtdViagens) || 0;
            const valorViagem = parseFloat(clearance.valorViagem) || 0;
            const totalLinha = qtdViagens * valorViagem;
            clearance.total = totalLinha;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="campo-data-wrapper" style="position: relative;">
                        <input type="text" 
                               value="${clearance.data || ''}" 
                               class="campo-editavel campo-data-calendario" 
                               placeholder="Digite: 10022026 ou 10/02/2026"
                               autocomplete="off"
                               data-clearance-id="${clearance.id}"
                               oninput="formatarDataInput(this)"
                               onblur="formatarDataOnBlur(this)"
                               onclick="abrirCalendario(this)"
                               style="width: 100%; padding-right: 40px;">
                        <button type="button" class="btn-calendario" onclick="abrirCalendario(this.previousElementSibling)" title="Abrir calendário">
                            <i class="fas fa-calendar"></i>
                        </button>
                    </div>
                </td>
                <td>
                    <input type="number" value="${qtdViagens}" class="campo-editavel" 
                           step="0.01" 
                           onchange="atualizarClearance(${clearance.id}, 'qtdViagens', parseFloat(this.value) || 0)" 
                           style="width: 100%;"
                           title="Digite qualquer quantidade, incluindo zero ou negativos">
                </td>
                <td>
                    <input type="text" value="${formatarMoedaInputValue(valorViagem)}" class="campo-editavel campo-valor" 
                           placeholder="R$ 0,00" 
                           data-clearance-id="${clearance.id}"
                           onblur="formatarEAtualizarValorViagem(this)"
                           oninput="formatarMoedaInputEmTempoReal(this)"
                           style="width: 100%;">
                </td>
                <td>
                    <input type="text" value="${clearance.observacao || ''}" class="campo-editavel" 
                           placeholder="Digite uma observação..." 
                           onchange="atualizarClearance(${clearance.id}, 'observacao', this.value)" 
                           style="width: 100%;">
                </td>
                <td>
                    <strong>${formatarMoeda(totalLinha)}</strong>
                </td>
                <td>
                    <button onclick="removerLinhaClearance(${clearance.id})" class="btn-secundario" 
                            style="padding: 5px 10px; font-size: 12px;">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    // Calcular totais - aceitar qualquer valor, incluindo negativos
    const totalViagens = clearances.reduce((acc, c) => acc + (parseFloat(c.qtdViagens) || 0), 0);
    const totalValores = clearances.reduce((acc, c) => {
        const qtd = parseFloat(c.qtdViagens) || 0;
        const valor = parseFloat(c.valorViagem) || 0;
        return acc + (qtd * valor);
    }, 0);
    
    if (totalQuantidade) {
        totalQuantidade.textContent = formatarMoeda(totalValores);
    }
}

// Atualizar Bota Fora - SEM VALIDAÇÃO, permite qualquer valor
function atualizarClearance(id, campo, valor) {
    const clearance = clearances.find(c => c.id === id);
    if (clearance) {
        // Aceitar qualquer valor sem validação ou restrição
        if (campo === 'qtdViagens') {
            // Permitir qualquer número, incluindo negativos e zero
            clearance[campo] = parseFloat(valor) || 0;
        } else if (campo === 'data') {
            // Aceitar qualquer data sem validação de ordem
            // IMPORTANTE: Salvar exatamente como digitado, sem usar new Date()
            // para evitar problemas de timezone (ex: 31/01/2026 virar 30/01/2026 ou 24/02/2026 virar 25/02/2026)
            const dataOriginal = String(valor).trim();
            clearance[campo] = dataOriginal;
        } else {
            clearance[campo] = valor;
        }
        
        // Recalcular total quando qtdViagens ou valorViagem mudarem
        if (campo === 'qtdViagens' || campo === 'valorViagem') {
            const qtd = parseFloat(clearance.qtdViagens) || 0;
            const valor = parseFloat(clearance.valorViagem) || 0;
            clearance.total = qtd * valor;
        }
        
        // NÃO REORDENAR - manter posição original
        atualizarTabelaClearance();
        salvarClearances();
        atualizarResumo();
    }
}

// Salvar clearances
function salvarClearances() {
    localStorage.setItem('botaFora', JSON.stringify(clearances));
}

// Salvar clearances
function salvarClearances() {
    localStorage.setItem('botaFora', JSON.stringify(clearances));
}

// Carregar clearances - SEM ORDENAÇÃO, mantém ordem exata salva
function carregarClearances() {
    const dados = localStorage.getItem('botaFora');
    if (dados) {
        try {
            clearances = JSON.parse(dados) || [];
            // Migrar dados antigos para novo formato
            clearances = clearances.map(c => {
                if (!c.hasOwnProperty('qtdViagens')) {
                    // Dados antigos - migrar
                    return {
                        ...c,
                        qtdViagens: parseFloat(c.quantidade) || 0, // Permitir qualquer valor
                        valorViagem: parseFloat(c.quantidade) || 0,
                        total: parseFloat(c.quantidade) || 0
                    };
                }
                return c;
            });
            // IMPORTANTE: NÃO ORDENAR - manter ordem original salva
            // Permite datas em qualquer ordem: dia 20 antes, dia 1 depois, etc.
            salvarClearances(); // Salvar dados migrados
        } catch (error) {
            console.error('Erro ao carregar clearances:', error);
            clearances = [];
        }
    }
}

// Atualizar resumo
function atualizarResumo() {
    const totalRegistros = document.getElementById('total-registros');
    const totalViagensResumo = document.getElementById('total-viagens-resumo');
    const totalQuantidadeResumo = document.getElementById('total-quantidade-resumo');
    
    if (totalRegistros) {
        totalRegistros.textContent = clearances.length;
    }
    
    if (totalViagensResumo) {
        const totalViagens = clearances.reduce((acc, c) => acc + (parseFloat(c.qtdViagens) || 0), 0);
        totalViagensResumo.textContent = totalViagens;
    }
    
    if (totalQuantidadeResumo) {
        const totalValores = clearances.reduce((acc, c) => {
            const qtd = parseFloat(c.qtdViagens) || 0;
            const valor = parseFloat(c.valorViagem) || 0;
            return acc + (qtd * valor);
        }, 0);
        totalQuantidadeResumo.textContent = formatarMoeda(totalValores);
    }
}

// Salvar dados do formulário
function salvarDadosFormulario() {
    const dadosFormulario = {
        cnpjEmpresa: document.getElementById('cnpj-empresa')?.value || '',
        nomeEmpresa: document.getElementById('nome-empresa')?.value || '',
        enderecoObra: document.getElementById('endereco-obra')?.value || '',
        ruaEmpresa: document.getElementById('rua-empresa')?.value || '',
        cidadeEmpresa: document.getElementById('cidade-empresa')?.value || '',
        cepEmpresa: document.getElementById('cep-empresa')?.value || '',
        cnpjCliente: document.getElementById('cnpj-cliente')?.value || '',
        nomeContrato: document.getElementById('nome-contrato')?.value || '',
        observacao: document.getElementById('observacao')?.value || ''
    };
    localStorage.setItem('botaForaFormulario', JSON.stringify(dadosFormulario));
}

// Carregar dados do formulário
function carregarDadosFormulario() {
    const dados = localStorage.getItem('botaForaFormulario');
    if (dados) {
        try {
            const dadosFormulario = JSON.parse(dados);
            
            // Restaurar valores dos campos
            if (dadosFormulario.cnpjEmpresa) {
                const campo = document.getElementById('cnpj-empresa');
                if (campo) campo.value = dadosFormulario.cnpjEmpresa;
            }
            
            if (dadosFormulario.nomeEmpresa) {
                const campo = document.getElementById('nome-empresa');
                if (campo) campo.value = dadosFormulario.nomeEmpresa;
            }
            
            if (dadosFormulario.enderecoObra) {
                const campo = document.getElementById('endereco-obra');
                if (campo) campo.value = dadosFormulario.enderecoObra;
            }
            
            if (dadosFormulario.ruaEmpresa) {
                const campo = document.getElementById('rua-empresa');
                if (campo) campo.value = dadosFormulario.ruaEmpresa;
            }
            
            if (dadosFormulario.cidadeEmpresa) {
                const campo = document.getElementById('cidade-empresa');
                if (campo) campo.value = dadosFormulario.cidadeEmpresa;
            }
            
            if (dadosFormulario.cepEmpresa) {
                const campo = document.getElementById('cep-empresa');
                if (campo) campo.value = dadosFormulario.cepEmpresa;
            }
            
            if (dadosFormulario.cnpjCliente) {
                const campo = document.getElementById('cnpj-cliente');
                if (campo) campo.value = dadosFormulario.cnpjCliente;
            }
            
            if (dadosFormulario.nomeContrato) {
                const campo = document.getElementById('nome-contrato');
                if (campo) campo.value = dadosFormulario.nomeContrato;
            }
            
            if (dadosFormulario.observacao) {
                const campo = document.getElementById('observacao');
                if (campo) campo.value = dadosFormulario.observacao;
            }
        } catch (error) {
            console.error('Erro ao carregar dados do formulário:', error);
        }
    }
}

// Configurar salvamento automático de todos os campos
function configurarSalvamentoAutomatico() {
    // Lista de IDs dos campos que devem ser salvos automaticamente
    const camposParaSalvar = [
        'cnpj-empresa',
        'nome-empresa',
        'endereco-obra',
        'rua-empresa',
        'cidade-empresa',
        'cep-empresa',
        'cnpj-cliente',
        'nome-contrato',
        'observacao'
    ];
    
    // Adicionar event listeners para salvar automaticamente quando o usuário digitar
    camposParaSalvar.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            // Salvar quando o campo perder o foco (blur)
            campo.addEventListener('blur', salvarDadosFormulario);
            
            // Salvar também quando o usuário pressionar Enter
            campo.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    salvarDadosFormulario();
                }
            });
            
            // Para textarea, salvar também durante a digitação (com debounce)
            if (campo.tagName === 'TEXTAREA') {
                let timeout;
                campo.addEventListener('input', function() {
                    clearTimeout(timeout);
                    timeout = setTimeout(salvarDadosFormulario, 1000); // Salvar após 1 segundo sem digitar
                });
            }
        }
    });
}

// Limpar Bota Fora - Limpa TUDO incluindo campos do formulário
function limparBotaFora() {
    if (confirm('Tem certeza que deseja limpar TODOS os dados do Bota Fora?\n\nIsso irá limpar:\n- Todas as datas e quantidades\n- Todos os campos do formulário\n\nEsta ação não pode ser desfeita!')) {
        // Limpar clearances
        clearances = [];
        atualizarTabelaClearance();
        salvarClearances();
        
        // Limpar campos do formulário
        document.getElementById('cnpj-empresa').value = '14.251.442/0001-15';
        document.getElementById('nome-empresa').value = 'M.A VIANA LOCAÇÕES E SERVIÇOS - ME';
        document.getElementById('endereco-obra').value = '';
        document.getElementById('rua-empresa').value = 'Rua Desembargador Auro Cerqueira Leite, 36';
        document.getElementById('cidade-empresa').value = 'Cidade Kemel - São Paulo, SP';
        document.getElementById('cep-empresa').value = '08130-410';
        document.getElementById('cnpj-cliente').value = '';
        document.getElementById('nome-contrato').value = 'Cons Vila Romana';
        document.getElementById('observacao').value = '';
        
        // Salvar dados limpos
        salvarDadosFormulario();
        
        // Limpar localStorage
        localStorage.removeItem('botaFora');
        localStorage.removeItem('botaForaFormulario');
        
        // Atualizar resumo
        atualizarResumo();
        
        mostrarNotificacao('Todos os dados foram limpos com sucesso!', 'success');
    }
}

// Formatar data para exibição (preserva a data exata sem conversão de timezone)
// IMPORTANTE: Esta função NUNCA usa new Date() para evitar problemas de timezone
// que podem fazer 31/01/2026 virar 30/01/2026 ou 24/02/2026 virar 25/02/2026
function formatarDataParaExibicao(dataString) {
    if (!dataString) return '';
    
    // Remover espaços e caracteres extras
    dataString = String(dataString).trim();
    
    // Se a data está no formato YYYY-MM-DD, converter para DD/MM/YYYY
    // Exemplo: "2026-02-24" -> "24/02/2026"
    if (dataString.includes('-')) {
        const partesData = dataString.split('-');
        if (partesData.length === 3) {
            // Formato: YYYY-MM-DD -> DD/MM/YYYY
            const ano = String(partesData[0]).trim();
            const mes = String(partesData[1]).trim();
            const dia = String(partesData[2]).trim();
            
            // Validar que temos valores válidos e não estão vazios
            if (ano && mes && dia && ano.length === 4) {
                // Preservar zeros à esquerda - CRÍTICO para evitar alterações
                // Exemplo: "24" vira "24", "2" vira "02"
                const diaFormatado = dia.padStart(2, '0');
                const mesFormatado = mes.padStart(2, '0');
                
                // Retornar no formato DD/MM/YYYY
                const dataFormatada = `${diaFormatado}/${mesFormatado}/${ano}`;
                return dataFormatada;
            }
        }
    }
    
    // Se já está em formato DD/MM/YYYY, usar diretamente
    // Mas verificar se está correto
    if (dataString.includes('/')) {
        return dataString;
    }
    
    // Se não reconheceu o formato, retornar como está
    return dataString;
}

// Formatar data - SIMPLES: permite digitar livremente, SEM interferência
function formatarDataInput(input) {
    // Permitir digitação totalmente livre - não fazer NADA durante a digitação
    // A formatação acontece apenas quando sair do campo (onblur)
    // Apenas salvar o valor atual para não perder dados
    const valor = input.value;
    const clearanceId = input.getAttribute('data-clearance-id');
    if (clearanceId) {
        atualizarClearance(parseFloat(clearanceId), 'data', valor);
    }
}

// Formatar data quando sair do campo (onblur) - formatação automática e inteligente
function formatarDataOnBlur(input) {
    let valor = input.value.trim();
    
    // Se vazio, limpar
    if (!valor) {
        input.value = '';
        const clearanceId = input.getAttribute('data-clearance-id');
        if (clearanceId) {
            atualizarClearance(parseFloat(clearanceId), 'data', '');
        }
        return;
    }
    
    // Se já está formatado corretamente (DD/MM/YYYY), manter e salvar
    if (valor.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const clearanceId = input.getAttribute('data-clearance-id');
        if (clearanceId) {
            atualizarClearance(parseFloat(clearanceId), 'data', valor);
        }
        return;
    }
    
    // Tentar reconhecer formato com barras já presentes (DD/MM/YYYY ou DD/MM/YY)
    if (valor.includes('/')) {
        const partes = valor.split('/');
        if (partes.length >= 2) {
            let dia = partes[0].replace(/\D/g, '').padStart(2, '0');
            let mes = partes[1].replace(/\D/g, '').padStart(2, '0');
            let ano = partes[2] ? partes[2].replace(/\D/g, '') : '';
            
            if (ano.length === 2) {
                const anoNum = parseInt(ano);
                ano = anoNum < 50 ? '20' + ano : '19' + ano;
            }
            
            if (dia && mes && ano && dia.length === 2 && mes.length === 2 && ano.length === 4) {
                const valorFormatado = `${dia}/${mes}/${ano}`;
                input.value = valorFormatado;
                const clearanceId = input.getAttribute('data-clearance-id');
                if (clearanceId) {
                    atualizarClearance(parseFloat(clearanceId), 'data', valorFormatado);
                }
                return;
            }
        }
    }
    
    // Remover tudo que não é número
    let numeros = valor.replace(/\D/g, '');
    
    // Se não tem números suficientes, manter como está
    if (!numeros || numeros.length < 4) {
        const clearanceId = input.getAttribute('data-clearance-id');
        if (clearanceId) {
            atualizarClearance(parseFloat(clearanceId), 'data', valor);
        }
        return;
    }
    
    // Limitar a 8 dígitos
    if (numeros.length > 8) {
        numeros = numeros.substring(0, 8);
    }
    
    // Extrair dia, mês e ano
    let dia = numeros.substring(0, 2) || '';
    let mes = numeros.substring(2, 4) || '';
    let ano = numeros.substring(4, 8) || '';
    
    // Adicionar zero à esquerda se necessário
    if (dia.length === 1 && dia) dia = '0' + dia;
    if (mes.length === 1 && mes) mes = '0' + mes;
    
    // Se ano tem 2 dígitos, assumir 20XX
    if (ano.length === 2) {
        const anoNum = parseInt(ano);
        ano = anoNum < 50 ? '20' + ano : '19' + ano;
    }
    
    // Formatar apenas se tiver dia e mês
    let valorFormatado = '';
    if (dia && mes) {
        valorFormatado = dia + '/' + mes;
        if (ano) {
            valorFormatado += '/' + ano;
        }
    } else {
        // Se não tem formato válido, manter como digitado
        valorFormatado = valor;
    }
    
    // Atualizar o campo
    input.value = valorFormatado;
    
    // Atualizar o clearance
    const clearanceId = input.getAttribute('data-clearance-id');
    if (clearanceId) {
        atualizarClearance(parseFloat(clearanceId), 'data', valorFormatado);
    }
}

// Formatar moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Formatar valor de input de moeda
function formatarMoedaInputValue(valor) {
    if (!valor || valor === 0) return '0,00';
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

// Formatar input de moeda em tempo real (sem perder o valor)
function formatarMoedaInputEmTempoReal(input) {
    // Permitir que o usuário digite livremente, só formatar visualmente
    // Não fazer nada durante a digitação para não interferir
    // A formatação completa será feita no onblur
    return;
}

// Formatar e atualizar valor da viagem quando perder o foco
function formatarEAtualizarValorViagem(input) {
    // Formatar o valor
    let valorTexto = input.value.replace(/[^\d,.-]/g, '');
    
    // Converter para número
    if (valorTexto.includes('.') && valorTexto.includes(',')) {
        valorTexto = valorTexto.replace(/\./g, '').replace(',', '.');
    } else if (valorTexto.includes(',')) {
        valorTexto = valorTexto.replace(',', '.');
    }
    
    const valorNumerico = parseFloat(valorTexto) || 0;
    
    // Formatar para exibição
    input.value = formatarMoedaInputValue(valorNumerico);
    
    // Atualizar no clearance
    const clearanceId = parseInt(input.getAttribute('data-clearance-id'));
    if (clearanceId) {
        atualizarClearance(clearanceId, 'valorViagem', valorNumerico);
    }
}

// Formatar input de moeda (versão antiga para compatibilidade)
function formatarMoedaInput(input) {
    // Salvar posição do cursor
    const cursorPos = input.selectionStart;
    const valorOriginal = input.value;
    
    // Se já está formatado corretamente, não fazer nada
    if (input.value.match(/^\d{1,3}(\.\d{3})*,\d{2}$/)) {
        return;
    }
    
    let valor = input.value.replace(/\D/g, '');
    
    if (valor === '') {
        input.value = '';
        return;
    }
    
    let numero = parseInt(valor);
    let formatado = (numero / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    input.value = formatado;
    
    // Restaurar posição do cursor
    const novoCursorPos = Math.min(cursorPos + (formatado.length - valorOriginal.length), formatado.length);
    input.setSelectionRange(novoCursorPos, novoCursorPos);
}

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remover notificação existente
    const notificacaoExistente = document.querySelector('.notificacao');
    if (notificacaoExistente) {
        notificacaoExistente.remove();
    }
    
    // Criar nova notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.innerHTML = `
        <div class="notificacao-conteudo">
            <div class="notificacao-mensagem">${mensagem}</div>
            <button class="notificacao-fechar">&times;</button>
        </div>
    `;
    
    // Adicionar ao body
    document.body.appendChild(notificacao);
    
    // Event listener para fechar
    const btnFechar = notificacao.querySelector('.notificacao-fechar');
    btnFechar.addEventListener('click', () => {
        notificacao.remove();
    });
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notificacao.parentNode) {
            notificacao.remove();
        }
    }, 5000);
}

// Processar imagem com OCR para reconhecer datas - VERSÃO MELHORADA
async function processarImagemOCR(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    
    // Verificar se Tesseract está disponível
    if (typeof Tesseract === 'undefined') {
        mostrarNotificacao('Erro: Biblioteca Tesseract.js não carregada. Recarregue a página.', 'error');
        return;
    }
    
    mostrarNotificacao('Processando imagem e reconhecendo datas...', 'info');
    
    try {
        // Processar imagem com OCR usando configurações otimizadas para melhor precisão
        const { data } = await Tesseract.recognize(file, 'por', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    const progress = Math.round(m.progress * 100);
                    mostrarNotificacao(`Reconhecendo texto: ${progress}%...`, 'info');
                }
            },
            // Configurações para melhor precisão - reconhecer números e caracteres de data
            tessedit_char_whitelist: '0123456789/-. :',
            preserve_interword_spaces: '1',
            tessedit_pageseg_mode: '6' // Modo de segmentação: tratar como bloco único de texto
        });
        
        console.log('Texto completo reconhecido:', data.text);
        console.log('Palavras reconhecidas:', data.words);
        
        // Extrair datas mantendo a ordem exata da imagem
        const datasEncontradas = extrairDatasComCoordenadas(data);
        
        if (datasEncontradas.length === 0) {
            // Tentar método alternativo com texto completo
            const datasAlternativas = extrairDatasDoTexto(data.text);
            if (datasAlternativas.length === 0) {
                mostrarNotificacao('Nenhuma data foi encontrada na imagem. Verifique se a imagem está nítida.', 'warning');
                event.target.value = '';
                return;
            }
            adicionarDatasAoSistema(datasAlternativas);
            mostrarNotificacao(`${datasAlternativas.length} data(s) encontrada(s) e adicionada(s) ao sistema!`, 'success');
        } else {
            // Adicionar datas ao sistema na ordem exata que aparecem na imagem
            adicionarDatasAoSistema(datasEncontradas);
            mostrarNotificacao(`${datasEncontradas.length} data(s) encontrada(s) e adicionada(s) ao sistema na ordem da imagem!`, 'success');
        }
        
        // Limpar o input
        event.target.value = '';
        
    } catch (error) {
        console.error('Erro ao processar imagem:', error);
        mostrarNotificacao('Erro ao processar imagem: ' + error.message, 'error');
        event.target.value = '';
    }
}

// Extrair datas usando coordenadas para manter ordem exata da imagem
function extrairDatasComCoordenadas(data) {
    const datasComCoordenadas = [];
    
    // Processar cada palavra reconhecida agrupando por linhas
    if (data.words && data.words.length > 0) {
        // Agrupar palavras por linha (mesma coordenada Y aproximada)
        const linhas = {};
        
        data.words.forEach(word => {
            const texto = word.text.trim();
            if (!texto) return;
            
            // Arredondar Y para agrupar palavras na mesma linha (tolerância de 5 pixels)
            const yArredondado = Math.round(word.bbox.y0 / 5) * 5;
            
            if (!linhas[yArredondado]) {
                linhas[yArredondado] = [];
            }
            
            linhas[yArredondado].push({
                texto: texto,
                x: word.bbox.x0,
                y: word.bbox.y0,
                bbox: word.bbox
            });
        });
        
        // Processar cada linha separadamente mantendo ordem
        Object.keys(linhas).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach(yKey => {
            const palavrasNaLinha = linhas[yKey];
            
            // Ordenar palavras na linha por X (da esquerda para direita)
            palavrasNaLinha.sort((a, b) => a.x - b.x);
            
            // Juntar palavras da linha para formar texto completo
            const textoLinha = palavrasNaLinha.map(p => p.texto).join(' ');
            
            // Tentar encontrar datas no texto da linha completa primeiro
            let datasNaLinha = encontrarDatasNoTexto(textoLinha);
            
            // Se não encontrou datas na linha completa, tentar palavra por palavra
            if (datasNaLinha.length === 0) {
                palavrasNaLinha.forEach(palavra => {
                    const datasNaPalavra = encontrarDatasNoTexto(palavra.texto);
                    datasNaPalavra.forEach(dataFormatada => {
                        datasComCoordenadas.push({
                            data: dataFormatada,
                            y: palavra.y,
                            x: palavra.x,
                            textoOriginal: palavra.texto
                        });
                    });
                });
            } else {
                // Adicionar datas encontradas na linha mantendo ordem
                datasNaLinha.forEach(dataFormatada => {
                    // Usar coordenada da primeira palavra da linha
                    datasComCoordenadas.push({
                        data: dataFormatada,
                        y: palavrasNaLinha[0].y,
                        x: palavrasNaLinha[0].x,
                        textoOriginal: textoLinha
                    });
                });
            }
        });
    }
    
    // Ordenar por posição na imagem: primeiro por Y (de cima para baixo), depois por X (da esquerda para direita)
    datasComCoordenadas.sort((a, b) => {
        // Tolerância de 10 pixels para considerar na mesma linha
        const diffY = Math.abs(a.y - b.y);
        if (diffY < 10) {
            // Mesma linha, ordenar por X
            return a.x - b.x;
        }
        // Linhas diferentes, ordenar por Y
        return a.y - b.y;
    });
    
    // Extrair apenas as datas únicas mantendo a ordem
    const datasUnicas = [];
    datasComCoordenadas.forEach(item => {
        if (!datasUnicas.includes(item.data)) {
            datasUnicas.push(item.data);
        }
    });
    
    console.log('=== RECONHECIMENTO DE DATAS ===');
    console.log('Total de datas encontradas:', datasUnicas.length);
    console.log('Datas na ordem da imagem:', datasUnicas);
    console.log('Detalhes das coordenadas:', datasComCoordenadas.map(d => ({ 
        data: d.data, 
        y: Math.round(d.y), 
        x: Math.round(d.x),
        texto: d.textoOriginal.substring(0, 30)
    })));
    
    return datasUnicas;
}

// Encontrar datas em um texto específico - VERSÃO MELHORADA
function encontrarDatasNoTexto(texto) {
    const datasEncontradas = [];
    
    // Limpar texto de caracteres problemáticos do OCR
    // Substituir possíveis erros comuns: O por 0, I por 1, l por 1
    texto = texto.replace(/[Oo]/g, '0').replace(/[Il]/g, '1');
    
    // Padrões mais flexíveis para reconhecer datas
    const padroes = [
        // DD/MM/YYYY ou DD-MM-YYYY ou DD.MM.YYYY (com espaços opcionais)
        /(\d{1,2})[\/\-\.\s]+(\d{1,2})[\/\-\.\s]+(\d{4})/g,
        // DD/MM/YY ou DD-MM-YY ou DD.MM.YY (com espaços opcionais)
        /(\d{1,2})[\/\-\.\s]+(\d{1,2})[\/\-\.\s]+(\d{2})/g,
        // DDMMYYYY (sem separadores, 8 dígitos)
        /(\d{2})(\d{2})(\d{4})/g,
        // DDMMYY (sem separadores, 6 dígitos)
        /(\d{2})(\d{2})(\d{2})/g,
        // Formato com espaços: DD MM YYYY
        /(\d{1,2})\s+(\d{1,2})\s+(\d{4})/g,
        // Formato com espaços: DD MM YY
        /(\d{1,2})\s+(\d{1,2})\s+(\d{2})/g,
    ];
    
    padroes.forEach(padrao => {
        let match;
        padrao.lastIndex = 0;
        while ((match = padrao.exec(texto)) !== null) {
            let dia = match[1].trim().replace(/[^\d]/g, '');
            let mes = match[2].trim().replace(/[^\d]/g, '');
            let ano = match[3].trim().replace(/[^\d]/g, '');
            
            // Validar que temos números válidos
            if (!dia || !mes || !ano) continue;
            
            // Garantir 2 dígitos para dia e mês
            dia = dia.padStart(2, '0');
            mes = mes.padStart(2, '0');
            
            // Se ano tem 2 dígitos, assumir 20XX
            if (ano.length === 2) {
                const anoNum = parseInt(ano);
                if (isNaN(anoNum)) continue;
                ano = anoNum < 50 ? '20' + ano : '19' + ano;
            }
            
            // Validar data
            const diaNum = parseInt(dia);
            const mesNum = parseInt(mes);
            const anoNum = parseInt(ano);
            
            if (!isNaN(diaNum) && !isNaN(mesNum) && !isNaN(anoNum) &&
                diaNum >= 1 && diaNum <= 31 && 
                mesNum >= 1 && mesNum <= 12 &&
                anoNum >= 1900 && anoNum <= 2100) {
                
                const dataFormatada = `${dia}/${mes}/${ano}`;
                if (!datasEncontradas.includes(dataFormatada)) {
                    datasEncontradas.push(dataFormatada);
                }
            }
        }
    });
    
    return datasEncontradas;
}

// Extrair datas do texto reconhecido (método alternativo)
function extrairDatasDoTexto(texto) {
    // Manter o texto original para melhor reconhecimento
    const textoOriginal = texto;
    
    // Padrões para reconhecer datas em diferentes formatos
    const padroes = [
        /(\d{1,2})[\/\-\.\s]+(\d{1,2})[\/\-\.\s]+(\d{4})/g,  // DD/MM/YYYY (4 dígitos ano)
        /(\d{1,2})[\/\-\.\s]+(\d{1,2})[\/\-\.\s]+(\d{2})/g,   // DD/MM/YY (2 dígitos ano)
        /(\d{2})[\/\-\.\s]+(\d{2})[\/\-\.\s]+(\d{4})/g,        // DD/MM/YYYY (garantir 2 dígitos)
        /(\d{2})(\d{2})(\d{4})/g,                              // DDMMYYYY (sem separadores)
    ];
    
    // Armazenar posições das datas no texto para manter a ordem
    const datasComPosicao = [];
    
    padroes.forEach(padrao => {
        let match;
        padrao.lastIndex = 0;
        while ((match = padrao.exec(texto)) !== null) {
            let dia = match[1].trim();
            let mes = match[2].trim();
            let ano = match[3].trim();
            
            // Garantir 2 dígitos para dia e mês
            dia = dia.padStart(2, '0');
            mes = mes.padStart(2, '0');
            
            // Se ano tem 2 dígitos, assumir 20XX
            if (ano.length === 2) {
                const anoNum = parseInt(ano);
                ano = anoNum < 50 ? '20' + ano : '19' + ano;
            }
            
            // Validar data (dia entre 1-31, mês entre 1-12, ano entre 1900-2100)
            const diaNum = parseInt(dia);
            const mesNum = parseInt(mes);
            const anoNum = parseInt(ano);
            
            if (diaNum >= 1 && diaNum <= 31 && 
                mesNum >= 1 && mesNum <= 12 &&
                anoNum >= 1900 && anoNum <= 2100) {
                
                const dataFormatada = `${dia}/${mes}/${ano}`;
                const posicao = match.index;
                
                // Verificar se a data já não foi adicionada (evitar duplicatas próximas)
                const jaExiste = datasComPosicao.find(d => 
                    d.data === dataFormatada && Math.abs(d.posicao - posicao) < 20
                );
                
                if (!jaExiste) {
                    datasComPosicao.push({
                        data: dataFormatada,
                        posicao: posicao,
                        textoOriginal: match[0]
                    });
                }
            }
        }
    });
    
    // Ordenar por posição no texto (ordem de aparição)
    datasComPosicao.sort((a, b) => a.posicao - b.posicao);
    
    // Extrair apenas as datas únicas na ordem
    const datasUnicas = [];
    datasComPosicao.forEach(item => {
        if (!datasUnicas.includes(item.data)) {
            datasUnicas.push(item.data);
        }
    });
    
    console.log('Datas encontradas no texto:', datasUnicas);
    console.log('Texto original:', textoOriginal);
    
    return datasUnicas;
}

// Adicionar datas ao sistema na ordem que aparecem
function adicionarDatasAoSistema(datas) {
    datas.forEach(data => {
        const clearance = {
            id: Date.now() + Math.random(),
            qtdViagens: 0,
            valorViagem: 0,
            data: data,
            observacao: 'Importado de imagem',
            total: 0
        };
        
        clearances.push(clearance);
    });
    
    atualizarTabelaClearance();
    salvarClearances();
    atualizarResumo();
}

// Variável global para controlar o calendário aberto
let calendarioAtual = null;
let inputCalendarioAtual = null;

// Abrir calendário popup
function abrirCalendario(input) {
    // Fechar calendário anterior se existir
    fecharCalendario();
    
    // Salvar referência do input atual
    inputCalendarioAtual = input;
    
    // Criar calendário se não existir
    let calendario = document.getElementById('calendario-popup-global');
    if (!calendario) {
        calendario = criarCalendario();
        document.body.appendChild(calendario);
    }
    
    // Posicionar calendário próximo ao input
    const rect = input.getBoundingClientRect();
    calendario.style.top = (rect.bottom + window.scrollY + 5) + 'px';
    calendario.style.left = (rect.left + window.scrollX) + 'px';
    
    // Mostrar calendário
    calendario.classList.add('ativo');
    calendarioAtual = calendario;
    
    // Carregar mês atual ou mês da data no input
    let dataAtual = new Date();
    if (input.value) {
        const dataInput = parsearDataInput(input.value);
        if (dataInput) {
            dataAtual = dataInput;
        }
    }
    
    atualizarCalendario(dataAtual);
    
    // Fechar ao clicar fora
    setTimeout(() => {
        document.addEventListener('click', fecharCalendarioAoClicarFora);
    }, 100);
}

// Criar estrutura do calendário
function criarCalendario() {
    const calendario = document.createElement('div');
    calendario.id = 'calendario-popup-global';
    calendario.className = 'calendario-popup';
    
    calendario.innerHTML = `
        <div class="calendario-header">
            <button onclick="navegarMes(-1)"><i class="fas fa-chevron-left"></i></button>
            <div class="calendario-mes-ano" id="calendario-mes-ano"></div>
            <button onclick="navegarMes(1)"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="calendario-grid" id="calendario-grid">
            <!-- Dias serão inseridos aqui -->
        </div>
    `;
    
    return calendario;
}

// Atualizar calendário com mês específico
function atualizarCalendario(data) {
    const mesAno = document.getElementById('calendario-mes-ano');
    const grid = document.getElementById('calendario-grid');
    
    if (!mesAno || !grid) return;
    
    // Nomes dos meses
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    // Atualizar cabeçalho
    mesAno.textContent = `${meses[data.getMonth()]} ${data.getFullYear()}`;
    mesAno.setAttribute('data-mes', data.getMonth());
    mesAno.setAttribute('data-ano', data.getFullYear());
    
    // Limpar grid
    grid.innerHTML = '';
    
    // Adicionar dias da semana
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    diasSemana.forEach(dia => {
        const div = document.createElement('div');
        div.className = 'calendario-dia-semana';
        div.textContent = dia;
        grid.appendChild(div);
    });
    
    // Primeiro dia do mês
    const primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1);
    const ultimoDia = new Date(data.getFullYear(), data.getMonth() + 1, 0);
    const primeiroDiaSemana = primeiroDia.getDay();
    const diasNoMes = ultimoDia.getDate();
    
    // Dias do mês anterior
    for (let i = 0; i < primeiroDiaSemana; i++) {
        const diaAnterior = new Date(data.getFullYear(), data.getMonth(), -i);
        const div = document.createElement('div');
        div.className = 'calendario-dia outro-mes';
        div.textContent = diaAnterior.getDate();
        grid.appendChild(div);
    }
    
    // Dias do mês atual
    const hoje = new Date();
    const dataSelecionada = inputCalendarioAtual ? parsearDataInput(inputCalendarioAtual.value) : null;
    
    for (let dia = 1; dia <= diasNoMes; dia++) {
        const div = document.createElement('div');
        div.className = 'calendario-dia';
        div.textContent = dia;
        
        const dataDia = new Date(data.getFullYear(), data.getMonth(), dia);
        
        // Marcar hoje
        if (dataDia.toDateString() === hoje.toDateString()) {
            div.classList.add('hoje');
        }
        
        // Marcar selecionado
        if (dataSelecionada && dataDia.toDateString() === dataSelecionada.toDateString()) {
            div.classList.add('selecionado');
        }
        
        div.onclick = () => selecionarData(dia, data.getMonth(), data.getFullYear());
        grid.appendChild(div);
    }
    
    // Completar última semana
    const diasRestantes = 42 - (primeiroDiaSemana + diasNoMes);
    for (let dia = 1; dia <= diasRestantes; dia++) {
        const div = document.createElement('div');
        div.className = 'calendario-dia outro-mes';
        div.textContent = dia;
        grid.appendChild(div);
    }
}

// Navegar entre meses
function navegarMes(direcao) {
    const mesAno = document.getElementById('calendario-mes-ano');
    if (!mesAno) return;
    
    const mesAtual = parseInt(mesAno.getAttribute('data-mes'));
    const anoAtual = parseInt(mesAno.getAttribute('data-ano'));
    
    const novaData = new Date(anoAtual, mesAtual + direcao, 1);
    atualizarCalendario(novaData);
}

// Selecionar data
function selecionarData(dia, mes, ano) {
    if (!inputCalendarioAtual) return;
    
    const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}/${ano}`;
    inputCalendarioAtual.value = dataFormatada;
    
    // Atualizar clearance
    const clearanceId = inputCalendarioAtual.getAttribute('data-clearance-id');
    if (clearanceId) {
        atualizarClearance(parseFloat(clearanceId), 'data', dataFormatada);
    }
    
    // Formatar
    formatarDataOnBlur(inputCalendarioAtual);
    
    // Fechar calendário
    fecharCalendario();
}

// Parsear data do input
function parsearDataInput(valor) {
    if (!valor) return null;
    
    // Tentar formatos: DD/MM/YYYY, DD-MM-YYYY, DDMMYYYY
    let dia, mes, ano;
    
    if (valor.includes('/')) {
        const partes = valor.split('/');
        if (partes.length >= 3) {
            dia = parseInt(partes[0]);
            mes = parseInt(partes[1]) - 1;
            ano = parseInt(partes[2]);
        }
    } else if (valor.includes('-')) {
        const partes = valor.split('-');
        if (partes.length >= 3) {
            dia = parseInt(partes[0]);
            mes = parseInt(partes[1]) - 1;
            ano = parseInt(partes[2]);
        }
    } else {
        // Formato DDMMYYYY
        const numeros = valor.replace(/\D/g, '');
        if (numeros.length >= 6) {
            dia = parseInt(numeros.substring(0, 2));
            mes = parseInt(numeros.substring(2, 4)) - 1;
            ano = parseInt(numeros.substring(4, 8));
        }
    }
    
    if (dia && mes !== undefined && ano) {
        return new Date(ano, mes, dia);
    }
    
    return null;
}

// Fechar calendário
function fecharCalendario() {
    if (calendarioAtual) {
        calendarioAtual.classList.remove('ativo');
    }
    calendarioAtual = null;
    inputCalendarioAtual = null;
    document.removeEventListener('click', fecharCalendarioAoClicarFora);
}

// Fechar calendário ao clicar fora
function fecharCalendarioAoClicarFora(event) {
    const calendario = document.getElementById('calendario-popup-global');
    if (calendario && !calendario.contains(event.target) && 
        !event.target.closest('.campo-data-wrapper')) {
        fecharCalendario();
    }
}

// Atualizar interface
function atualizarInterface() {
    // Atualizar data no rodapé
    const hoje = new Date();
    const dataFooter = document.getElementById('data-footer');
    if (dataFooter) {
        dataFooter.textContent = hoje.toLocaleDateString('pt-BR');
    }
    
    // Atualizar tabela se houver dados
    if (clearances.length > 0) {
        atualizarTabelaClearance();
    }
}

// Exportar PDF do Bota Fora
async function exportarPDFBotaFora() {
    if (clearances.length === 0) {
        mostrarNotificacao('Adicione pelo menos uma data e quantidade no Bota Fora', 'warning');
        return;
    }
    
    mostrarNotificacao('Exportando PDF do Bota Fora...', 'info');
    
    // Verificar se a biblioteca jsPDF está carregada
    if (typeof window.jspdf === 'undefined') {
        mostrarNotificacao('Erro: Biblioteca jsPDF não carregada. Recarregue a página.', 'error');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            mostrarNotificacao('Erro: Biblioteca jsPDF não encontrada', 'error');
            return;
        }
        
        const doc = new jsPDF('portrait', 'mm', 'a4');
        
        // Configurações
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 8;
        
        // Obter dados do formulário
        const cnpjEmpresa = document.getElementById('cnpj-empresa')?.value || '14.251.442/0001-15';
        const nomeEmpresa = document.getElementById('nome-empresa')?.value || 'M.A VIANA LOCAÇÕES E SERVIÇOS - ME';
        const ruaEmpresa = document.getElementById('rua-empresa')?.value || 'Rua Desembargador Auro Cerqueira Leite, 36';
        const cidadeEmpresa = document.getElementById('cidade-empresa')?.value || 'Cidade Kemel - São Paulo, SP';
        const cepEmpresa = document.getElementById('cep-empresa')?.value || '08130-410';
        const cnpjCliente = document.getElementById('cnpj-cliente')?.value || '';
        const nomeContrato = document.getElementById('nome-contrato')?.value || 'Cons Vila Romana';
        const enderecoObra = document.getElementById('endereco-obra')?.value || '';
        const observacao = document.getElementById('observacao')?.value || '';
        
        // Cabeçalho profissional com imagem - GARANTIR QUE APAREÇA
        console.log('🔄 Iniciando carregamento da imagem para o PDF...');
        
        const adicionarImagemAoPDF = (dataURL) => {
            try {
                // Verificar se o dataURL é válido
                if (!dataURL || !dataURL.startsWith('data:image')) {
                    console.error('❌ DataURL inválido:', dataURL ? dataURL.substring(0, 50) + '...' : 'null');
                    return false;
                }
                
                // Tamanho do logo similar ao cabeçalho (80px no HTML = ~30mm no PDF)
                const logoWidth = 30;
                const logoHeight = 30;
                const logoX = pageWidth / 2 - logoWidth / 2;
                const logoY = 5;
                
                // Adicionar imagem ao PDF
                doc.addImage(dataURL, 'PNG', logoX, logoY, logoWidth, logoHeight);
                console.log('✅✅✅ IMAGEM ADICIONADA AO PDF COM SUCESSO!');
                console.log('   Posição: X=' + logoX + ', Y=' + logoY + ', W=' + logoWidth + ', H=' + logoHeight);
                return true;
            } catch (error) {
                console.error('❌ Erro ao adicionar imagem ao PDF:', error);
                console.error('   Detalhes do erro:', error.message);
                return false;
            }
        };
        
        // Função para converter imagem em dataURL
        const imagemParaDataURL = (img) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Usar dimensões naturais da imagem ou valores padrão
                const width = img.naturalWidth || img.width || 200;
                const height = img.naturalHeight || img.height || 200;
                
                canvas.width = width;
                canvas.height = height;
                
                // Desenhar a imagem no canvas
                ctx.drawImage(img, 0, 0, width, height);
                
                // Converter para dataURL
                const dataURL = canvas.toDataURL('image/png');
                console.log('✅ Imagem convertida para dataURL com sucesso');
                return dataURL;
            } catch (e) {
                console.error('❌ Erro ao converter imagem para dataURL:', e);
                return null;
            }
        };
        
        let imagemCarregada = false;
        
        // Lista de arquivos de imagem para tentar (priorizando gerar_icone_mv.png)
        const arquivosImagem = [
            'images/gerar_icone_mv.png',
            './images/gerar_icone_mv.png',
            'images/gerar_icone.png',
            './images/gerar_icone.png'
        ];
        
        // MÉTODO 1: Tentar usar imagem do DOM primeiro (gerar_icone_mv.png) - PRIORIDADE MÁXIMA
        const imgDOM = document.querySelector('img[src*="gerar_icone_mv"], img[src*="gerar_icone"], .logo-lateral-titulo img, #logo-lateral img');
        if (imgDOM && !imagemCarregada) {
            console.log('📸 Tentando usar imagem do DOM (cabeçalho)...');
            const tentarUsarDOM = async () => {
                // Aguardar a imagem carregar completamente
                if (!imgDOM.complete || imgDOM.naturalWidth === 0) {
                    await new Promise((resolve) => {
                        const timeout = setTimeout(() => {
                            console.log('⏱️ Timeout aguardando imagem do DOM carregar');
                            resolve();
                        }, 3000);
                        
                        imgDOM.onload = () => {
                            clearTimeout(timeout);
                            resolve();
                        };
                        
                        imgDOM.onerror = () => {
                            clearTimeout(timeout);
                            resolve();
                        };
                        
                        // Se já está carregada, resolver imediatamente
                        if (imgDOM.complete && imgDOM.naturalWidth > 0) {
                            clearTimeout(timeout);
                            resolve();
                        }
                    });
                }
                
                if (imgDOM.complete && imgDOM.naturalWidth > 0) {
                    try {
                        const dataURL = imagemParaDataURL(imgDOM);
                        if (dataURL) {
                            imagemCarregada = adicionarImagemAoPDF(dataURL);
                            if (imagemCarregada) {
                                console.log('✅✅✅ Imagem do DOM (cabeçalho) adicionada ao PDF!');
                                return true;
                            }
                        }
                    } catch (e) {
                        console.error('❌ Erro ao processar imagem do DOM:', e);
                    }
                }
                return false;
            };
            
            await tentarUsarDOM();
        }
        
        // MÉTODO 2: Carregar do arquivo usando Image object (priorizando gerar_icone_mv.png)
        if (!imagemCarregada) {
            console.log('📁 Tentando carregar imagem do arquivo...');
            for (const arquivo of arquivosImagem) {
                if (imagemCarregada) break;
                
                await new Promise((resolve) => {
                    const img = new Image();
                    // Remover crossOrigin para evitar problemas de CORS com arquivos locais
                    
                    img.onload = function() {
                        console.log(`✅ Imagem ${arquivo} carregada com sucesso!`);
                        try {
                            const dataURL = imagemParaDataURL(img);
                            if (dataURL) {
                                imagemCarregada = adicionarImagemAoPDF(dataURL);
                                if (imagemCarregada) {
                                    console.log(`✅✅✅ Imagem ${arquivo} adicionada ao PDF com sucesso!`);
                                } else {
                                    console.log(`⚠️ Imagem ${arquivo} convertida mas não adicionada ao PDF`);
                                }
                            } else {
                                console.log(`⚠️ Falha ao converter ${arquivo} para dataURL`);
                            }
                        } catch (e) {
                            console.error(`❌ Erro ao processar ${arquivo}:`, e);
                        }
                        resolve();
                    };
                    
                    img.onerror = function(error) {
                        console.log(`❌ Falha ao carregar ${arquivo}:`, error);
                        resolve();
                    };
                    
                    console.log(`🔄 Tentando carregar: ${arquivo}`);
                    img.src = arquivo;
                    
                    // Timeout de segurança
                    setTimeout(() => {
                        if (!imagemCarregada) {
                            console.log(`⏱️ Timeout ao carregar ${arquivo}`);
                            resolve();
                        }
                    }, 3000);
                });
            }
        }
        
        // MÉTODO 3: Tentar usar fetch (última tentativa)
        if (!imagemCarregada) {
            console.log('🌐 Tentando carregar imagem via fetch...');
            for (const arquivo of arquivosImagem) {
                if (imagemCarregada) break;
                
                try {
                    const response = await fetch(arquivo);
                    if (response.ok) {
                        const blob = await response.blob();
                        const reader = new FileReader();
                        
                        await new Promise((resolve) => {
                            reader.onload = function(e) {
                                try {
                                    const dataURL = e.target.result;
                                    imagemCarregada = adicionarImagemAoPDF(dataURL);
                                    if (imagemCarregada) {
                                        console.log(`✅✅✅ Imagem ${arquivo} carregada via fetch e adicionada ao PDF!`);
                                    } else {
                                        console.log(`⚠️ Imagem ${arquivo} carregada via fetch mas não adicionada ao PDF`);
                                    }
                                } catch (e) {
                                    console.error(`❌ Erro ao processar imagem via fetch:`, e);
                                }
                                resolve();
                            };
                            reader.onerror = () => {
                                console.log(`❌ Erro ao ler ${arquivo} via FileReader`);
                                resolve();
                            };
                            reader.readAsDataURL(blob);
                        });
                    } else {
                        console.log(`❌ Resposta não OK para ${arquivo}: ${response.status}`);
                    }
                } catch (e) {
                    console.log(`❌ Erro ao tentar fetch ${arquivo}:`, e);
                }
            }
        }
        
        if (!imagemCarregada) {
            console.error('❌❌❌ ERRO: Nenhuma imagem foi adicionada ao PDF!');
            console.error('Verifique se o arquivo existe: images/gerar_icone_mv.png');
            console.error('Arquivos tentados:');
            arquivosImagem.forEach(arq => console.error(`  - ${arq}`));
            
            // Tentar uma última vez com o arquivo correto
            try {
                console.log('🔄 Última tentativa com images/gerar_icone_mv.png...');
                const img = new Image();
                img.onload = () => {
                    try {
                        const dataURL = imagemParaDataURL(img);
                        if (dataURL) {
                            imagemCarregada = adicionarImagemAoPDF(dataURL);
                            if (imagemCarregada) {
                                console.log('✅✅✅ Última tentativa: Imagem adicionada ao PDF!');
                            }
                        }
                    } catch (e) {
                        console.error('Erro na última tentativa:', e);
                    }
                };
                img.onerror = () => {
                    console.error('❌ Última tentativa falhou: imagem não carregou');
                };
                img.src = 'images/gerar_icone_mv.png';
                await new Promise((resolve) => {
                    setTimeout(resolve, 2000);
                });
            } catch (e) {
                console.error('❌ Última tentativa falhou com erro:', e);
            }
        } else {
            console.log('🎉🎉🎉 SUCESSO: IMAGEM ADICIONADA AO PDF!');
        }
        
        // Pequeno delay para garantir que a imagem foi processada
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Ajustar posição do título baseado se o logo foi adicionado
        let posicaoInicial = 20;
        if (imagemCarregada) {
            posicaoInicial = 40; // Logo ocupa ~35mm, então começar o texto em 40mm
        }
        
        // Título principal
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('BOTA FORA', pageWidth / 2, posicaoInicial, { align: 'center' });
        
        // Nome da empresa
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('M.A VIANA LOCAÇÕES E SERVIÇOS - ME', pageWidth / 2, posicaoInicial + 5, { align: 'center' });
        
        // Linha separadora
        doc.setDrawColor(0, 123, 255);
        doc.setLineWidth(1);
        const linhaSeparadoraY = posicaoInicial + 10;
        doc.line(margin, linhaSeparadoraY, pageWidth - margin, linhaSeparadoraY);
        
        // Informações da empresa
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        const dadosEmpresaY = linhaSeparadoraY + 5;
        doc.text('DADOS DA EMPRESA', margin, dadosEmpresaY);
        
        doc.setFontSize(7);
        doc.setFont(undefined, 'normal');
        doc.text(`CNPJ: ${cnpjEmpresa}`, margin, dadosEmpresaY + 5);
        doc.text(ruaEmpresa, margin, dadosEmpresaY + 9);
        doc.text(cidadeEmpresa, margin, dadosEmpresaY + 13);
        doc.text(`CEP: ${cepEmpresa}`, margin, dadosEmpresaY + 17);
        
        // Dados do cliente - SEMPRE mostrar
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        const dadosClienteY = dadosEmpresaY + 25;
        doc.text('DADOS DO CLIENTE', margin, dadosClienteY);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7);
        doc.text(`CNPJ Cliente: ${cnpjCliente || 'Não informado'}`, margin, dadosClienteY + 5);
        doc.text(`Nome do Contrato/Empresa: ${nomeContrato || 'Não informado'}`, margin, dadosClienteY + 9);
        
        if (enderecoObra) {
            doc.text(`Endereço: ${enderecoObra}`, margin, dadosClienteY + 13);
        }
        
        // Tabela de Bota Fora
        let tableY = dadosClienteY + 20;
        if (enderecoObra) {
            tableY = dadosClienteY + 24;
        }
        
        // Cabeçalho da tabela
        doc.setFillColor(0, 123, 255);
        doc.rect(margin, tableY, pageWidth - 2 * margin, 8, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('BOTA FORA', margin + (pageWidth - 2 * margin) / 2, tableY + 5, { align: 'center' });
        
        // Sub-cabeçalho
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, tableY + 8, pageWidth - 2 * margin, 6, 'F');
        doc.setDrawColor(0, 123, 255);
        doc.setLineWidth(0.3);
        doc.rect(margin, tableY + 8, pageWidth - 2 * margin, 6, 'S');
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(6);
        doc.setFont(undefined, 'bold');
        doc.text('Data', margin + 3, tableY + 12);
        doc.text('Qtd. Viagens', margin + 30, tableY + 12);
        doc.text('Valor/Viagem', margin + 50, tableY + 12);
        doc.text('Observação', margin + 75, tableY + 12);
        doc.text('Total', margin + 150, tableY + 12);
        
        // Dados da tabela
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(6);
        doc.setFont(undefined, 'normal');
        
        let currentY = tableY + 16;
        const maxY = pageHeight - 80;
        let totalQuantidade = 0;
        let totalViagens = 0;
        
        clearances.forEach((clearance) => {
            if (currentY > maxY) {
                doc.addPage();
                currentY = 20;
            }
            
            // Fundo da linha
            doc.setFillColor(255, 255, 255);
            doc.rect(margin, currentY - 2, pageWidth - 2 * margin, 6, 'F');
            
            // Borda da linha
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.2);
            doc.rect(margin, currentY - 2, pageWidth - 2 * margin, 6, 'S');
            
            // Data (PRIMEIRO) - Exibir EXATAMENTE como o usuário digitou
            // SEM NENHUMA formatação ou conversão
            // O usuário digita manualmente e o sistema preserva exatamente
            const dataParaExibir = String(clearance.data || '').trim();
            doc.setFont(undefined, 'normal');
            doc.text(dataParaExibir, margin + 3, currentY + 2);
            
            // Quantidade de viagens
            const qtdViagens = parseInt(clearance.qtdViagens) || 0;
            totalViagens += qtdViagens;
            doc.setFont(undefined, 'bold');
            doc.text(qtdViagens.toString(), margin + 30, currentY + 2);
            
            // Valor por viagem
            const valorViagem = parseFloat(clearance.valorViagem) || 0;
            doc.setFont(undefined, 'normal');
            doc.text(formatarMoeda(valorViagem), margin + 50, currentY + 2);
            
            // Observação
            const obs = clearance.observacao || '';
            const observacaoLimitada = obs.length > 30 ? obs.substring(0, 27) + '...' : obs;
            doc.text(observacaoLimitada || '-', margin + 75, currentY + 2);
            
            // Total (qtdViagens × valorViagem)
            const totalLinha = qtdViagens * valorViagem;
            totalQuantidade += totalLinha;
            doc.setFont(undefined, 'bold');
            doc.text(formatarMoeda(totalLinha), margin + 150, currentY + 2);
            doc.setFont(undefined, 'normal');
            
            currentY += 6;
        });
        
        // Linha de total
        currentY += 2;
        
        if (currentY > maxY) {
            doc.addPage();
            currentY = 20;
        }
        
        doc.setFillColor(0, 123, 255);
        doc.rect(margin, currentY - 2, pageWidth - 2 * margin, 6, 'F');
        doc.setDrawColor(0, 123, 255);
        doc.setLineWidth(0.3);
        doc.rect(margin, currentY - 2, pageWidth - 2 * margin, 6, 'S');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.text('TOTAL GERAL', margin + 3, currentY + 2);
        doc.text(totalViagens.toString() + ' viagens', margin + 30, currentY + 2);
        doc.text(formatarMoeda(totalQuantidade), margin + 150, currentY + 2);
        
        // Observação geral
        if (observacao) {
            currentY += 10;
            
            if (currentY > maxY) {
                doc.addPage();
                currentY = 20;
            }
            
            doc.setFontSize(8);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('OBSERVAÇÃO:', margin, currentY);
            
            doc.setFontSize(7);
            doc.setFont(undefined, 'normal');
            const observacaoLinhas = doc.splitTextToSize(observacao, pageWidth - 2 * margin);
            doc.text(observacaoLinhas, margin, currentY + 5);
            currentY += observacaoLinhas.length * 4;
        }
        
        // Rodapé
        currentY += 10;
        
        if (currentY > maxY) {
            doc.addPage();
            currentY = 20;
        }
        
        // Linha separadora
        doc.setDrawColor(0, 123, 255);
        doc.setLineWidth(0.5);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        
        currentY += 5;
        
        // Linhas para assinaturas
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(margin, currentY, margin + 80, currentY);
        doc.line(margin + 100, currentY, margin + 180, currentY);
        
        // Nomes das empresas
        doc.setFontSize(6);
        doc.setFont(undefined, 'bold');
        doc.text('M.A VIANA LOCAÇÕES E SERVIÇOS', margin, currentY + 4);
        doc.text('HABRAS', margin + 100, currentY + 4);
        
        // Data e local
        const dataFormatada = new Date().toLocaleDateString('pt-BR');
        doc.setFontSize(5);
        doc.setFont(undefined, 'normal');
        doc.text(`SÃO PAULO, ${dataFormatada}`, pageWidth / 2, currentY + 8, { align: 'center' });
        
        // Salvar
        const nomeArquivo = `bota-fora-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nomeArquivo);
        mostrarNotificacao('PDF do Bota Fora exportado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao exportar PDF do Bota Fora:', error);
        mostrarNotificacao('Erro ao exportar PDF do Bota Fora: ' + error.message, 'error');
    }
}

console.log('✅ Sistema de Bota Fora carregado com sucesso!');
