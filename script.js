// Garantir que a página sempre comece no topo e sem histórico de rolagem
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxUPv5nrP6tvStqu1KqPUKPtIodHH2oLw9podvNZfGO9BpjNOFhE_WebKoA8sYdXkrhMg/exec";

/* --- GERAÇÃO DAS PERGUNTAS --- */
const questions = [
    "Dificuldade nas atividades diárias?", "Satisfeito com sua visão?", "Dificuldade em tarefas do dia a dia?",
    "Consegue ler jornal/livro?", "Consegue ver rostos?", "Consegue ver preços?", "Dificuldade com obstáculos?",
    "Realiza atividades manuais?", "Lê legendas na TV?", "Pratica lazer visual?"
];

const container = document.getElementById('questionsContainer');
questions.forEach((q, index) => {
    const qNum = index + 1;
    const html = `
        <div class="question-item">
            <p class="question-text">${qNum}. ${q}</p>
            <div class="scale-options">
                ${createScaleButton(qNum, 1, 'Sem Dificuldade')}
                ${createScaleButton(qNum, 2, 'Alguma Dificuldade')}
                ${createScaleButton(qNum, 3, 'Muita Dificuldade')}
                ${createScaleButton(qNum, 4, 'Grande Dificuldade')}
            </div>
        </div><hr class="divider">`;
    container.insertAdjacentHTML('beforeend', html);
});

function createScaleButton(qIndex, value, label) {
    const id = `q${qIndex}_opt${value}`;
    const icons = {
        1: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
        2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
        3: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
        4: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="8" y1="9" x2="10" y2="11"></line><line x1="10" y1="9" x2="8" y2="11"></line><line x1="14" y1="9" x2="16" y2="11"></line><line x1="16" y1="9" x2="14" y2="11"></line></svg>'
    };
    return `
        <label class="scale-btn" for="${id}" id="label_${id}" onclick="toggleRadio(this, '${qIndex}', '${value}')">
            <input type="radio" id="${id}" name="q${qIndex}" value="${value}">
            <span class="number">${icons[value]}</span>
            <span class="label">${label}</span>
        </label>`;
}

function toggleRadio(labelElement, groupName, value) {
    const input = document.getElementById(labelElement.getAttribute('for'));
    const name = `q${groupName}`;
    const isAlreadyChecked = labelElement.classList.contains('checked');

    setTimeout(() => {
        if (isAlreadyChecked) {
            input.checked = false;
            labelElement.classList.remove('checked');
        } else {
            document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
                const lbl = document.getElementById(`label_${radio.id}`);
                if (lbl) lbl.classList.remove('checked');
            });
            labelElement.classList.add('checked');
            input.checked = true;
        }
        calculateScore();
    }, 10);
}

function calculateScore() {
    let total = 0, count = 0;
    for (let i = 1; i <= 10; i++) {
        const els = document.getElementsByName('q' + i);
        for (let el of els) if (el.checked) { total += +el.value; count++; }
    }
    const box = document.getElementById('scoreSection');
    if (count > 0) {
        box.style.display = 'block';
        document.getElementById('scoreDisplay').innerText = total;
        const txt = document.getElementById('scoreText');
        if (count === 10) {
            if (total <= 20) { txt.innerText = "Excelente/Boa"; box.style.background = "linear-gradient(135deg, #28a745, #81c784)"; }
            else if (total <= 30) { txt.innerText = "Dificuldade Moderada"; box.style.background = "linear-gradient(135deg, #FF9800, #FFC107)"; }
            else { txt.innerText = "Dificuldade Grave"; box.style.background = "linear-gradient(135deg, #d32f2f, #ef5350)"; }
        } else {
            txt.innerText = `Respondido ${count}/10`;
            box.style.background = "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))";
        }
    } else {
        box.style.display = 'none';
    }
}

/* --- LÓGICA DE BUSCA COM FEEDBACK VISUAL --- */
function buscarPaciente() {
    const prontuario = document.getElementById('prontuario').value;
    const btn = document.getElementById('btnBuscar');
    const feedback = document.getElementById('feedbackProntuario');
    const inputProntuario = document.getElementById('prontuario');

    // Reset visual antes de buscar
    feedback.className = "feedback-msg";
    feedback.innerHTML = "";
    inputProntuario.style.borderColor = "var(--color-border)";

    if (!prontuario) {
        limparCamposAutomaticos();
        return;
    }

    const iconOriginal = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    btn.disabled = true;

    fetch(`${SCRIPT_URL}?action=pesquisar&prontuario=${prontuario}`)
        .then(res => res.json())
        .then(data => {
            if (data.encontrado) {
                if (data.nome) document.getElementById('nome').value = data.nome;
                if (data.mae) document.getElementById('mae').value = data.mae;
                if (data.nascimento) document.getElementById('nascimento').value = data.nascimento;
                if (data.telefone) document.getElementById('telefone').value = data.telefone;

                document.getElementById('telefone').dispatchEvent(new Event('input'));
                bloquearCampos(true);

                // Sucesso Visual (Verde)
                inputProntuario.style.borderColor = "#28a745";
                feedback.innerHTML = '<i class="fa-solid fa-check-circle"></i> Paciente localizado.';
                feedback.className = "feedback-msg show success";
            } else {
                // Não Encontrado Visual (Aviso Laranja e Texto Curto)
                bloquearCampos(false);

                inputProntuario.classList.add('input-shake');
                setTimeout(() => inputProntuario.classList.remove('input-shake'), 500);

                // --- AQUI ESTÁ A MUDANÇA ---
                feedback.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Prontuário não encontrado.';
                feedback.className = "feedback-msg show warning";
            }
        })
        .catch(e => { console.error(e); bloquearCampos(false); })
        .finally(() => { btn.innerHTML = iconOriginal; btn.disabled = false; });
}

function bloquearCampos(bloquear) {
    ['nome', 'mae', 'nascimento'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.readOnly = bloquear;
            el.style.backgroundColor = bloquear ? "#f2f2f2" : "rgba(255,255,255,0.9)";
        }
    });
}

function limparCamposAutomaticos() {
    ['nome', 'mae', 'nascimento', 'telefone'].forEach(id => {
        document.getElementById(id).value = '';
    });
    bloquearCampos(false);
    document.getElementById('prontuario').style.borderColor = "var(--color-border)";
    document.getElementById('feedbackProntuario').className = "feedback-msg";
    document.getElementById('feedbackProntuario').innerHTML = "";
}

/* --- MODAIS --- */
function abrirModalSucesso() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fecharModalEResetar() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';

        document.getElementById('cataractForm').reset();
        bloquearCampos(false);
        document.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('checked'));
        selectStage('pre');
        document.getElementById('scoreSection').style.display = 'none';

        // Reset visual do LGPD e Prontuário
        document.getElementById('lgpdWrapper').classList.remove('active');
        limparCamposAutomaticos();

        const btn = document.getElementById('submitBtn');
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Avaliação';
        btn.disabled = true;
        btn.style.background = "";

    }, 300);
}

function fecharModalWarning() {
    const modal = document.getElementById('warningModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

/* --- EFEITO DE TROCA SUAVE --- */
function selectStage(stage, isInitial = false) {
    document.getElementById('stageInput').value = stage;
    const isPre = stage === 'pre';

    const mainContainer = document.getElementById('mainContainer');

    // Evita o flicker visual no carregamento inicial
    if (!isInitial) {
        mainContainer.classList.add('form-transitioning');
    }

    const applyChanges = () => {
        document.getElementById('btnPre').classList.toggle('active', isPre);
        document.getElementById('btnPos').classList.toggle('active', !isPre);

        const root = document.documentElement;
        const title = document.querySelector('h1');

        if (isPre) {
            root.style.setProperty('--color-primary', '#243786');
            root.style.setProperty('--color-primary-light', '#4c63b6');
            root.style.setProperty('--color-bg-gradient', 'linear-gradient(135deg, #f0f4ff 0%, #e3e8f8 100%)');
            title.innerText = "Avaliação Pré-Operatória";
        } else {
            root.style.setProperty('--color-primary', '#008F7A');
            root.style.setProperty('--color-primary-light', '#42E695');
            root.style.setProperty('--color-bg-gradient', 'linear-gradient(135deg, #f1f8e9 0%, #e0f2f1 100%)');
            title.innerText = "Avaliação Pós-Operatória";
        }

        if (!isInitial) {
            mainContainer.classList.remove('form-transitioning');
        }
    };

    if (isInitial) {
        applyChanges();
    } else {
        setTimeout(applyChanges, 200);
    }
}

// --- LISTENERS ---
const check = document.getElementById('lgpdConsent');
const submitBtn = document.getElementById('submitBtn');
const lgpdWrapper = document.getElementById('lgpdWrapper');

check.addEventListener('change', () => {
    submitBtn.disabled = !check.checked;
    if (check.checked) {
        lgpdWrapper.classList.add('active');
    } else {
        lgpdWrapper.classList.remove('active');
    }
});
selectStage('pre', true);
document.getElementById('prontuario').addEventListener('input', function (e) {
    if (!this.value) {
        limparCamposAutomaticos();
    }
});

document.getElementById('cataractForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // 1. Validar se TODAS as 10 perguntas foram respondidas
    let perguntasFaltantes = [];
    let primeiroElementoFaltante = null;

    for (let i = 1; i <= 10; i++) {
        const respondida = document.querySelector(`input[name="q${i}"]:checked`);
        if (!respondida) {
            perguntasFaltantes.push(i);
            const inputElement = document.querySelector(`input[name="q${i}"]`);
            if (inputElement) {
                const questionItem = inputElement.closest('.question-item');
                if (questionItem) {
                    if (!primeiroElementoFaltante) {
                        primeiroElementoFaltante = questionItem;
                    }
                    // Destacar a pergunta não respondida
                    questionItem.style.transition = "background-color 0.5s ease";
                    questionItem.style.backgroundColor = "#ffebee";
                    questionItem.style.padding = "15px";
                    questionItem.style.borderRadius = "12px";

                    setTimeout(() => {
                        questionItem.style.backgroundColor = "transparent";
                        questionItem.style.padding = "0";
                    }, 4000);
                }
            }
        }
    }

    if (perguntasFaltantes.length > 0) {
        // Montar mensagem
        let msg = "Por favor, responda a";
        if (perguntasFaltantes.length === 1) {
            msg += ` pergunta ${perguntasFaltantes[0]}`;
        } else {
            const ultimos = perguntasFaltantes.pop();
            msg += `s perguntas ${perguntasFaltantes.join(', ')} e ${ultimos}`;
        }
        msg += " da Avaliação Visual antes de enviar.";

        document.getElementById('warningText').innerText = msg;

        // Abrir Modal
        const modal = document.getElementById('warningModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);

        if (primeiroElementoFaltante) {
            primeiroElementoFaltante.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return; // Bloqueia o envio
    }

    // 2. Validação padrão do HTML5
    if (!this.checkValidity()) {
        const invalid = this.querySelector(':invalid');
        if (invalid) invalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
    submitBtn.disabled = true;
    submitBtn.style.background = "#666";

    fetch(SCRIPT_URL, { method: "POST", body: new FormData(this) })
        .then(r => r.text())
        .then(texto => {
            if (texto.includes("success")) {
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Enviado!';
                submitBtn.style.background = "#28a745";
                abrirModalSucesso();
            } else {
                throw new Error(texto);
            }
        })
        .catch(erro => {
            alert("❌ Erro: " + erro);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = "#d32f2f";
        });
});

const inputTelefone = document.getElementById('telefone');
inputTelefone.addEventListener('input', function (e) {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length > 10) {
        valor = valor.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (valor.length > 5) {
        valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    }
    e.target.value = valor;
});