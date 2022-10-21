(function() {
    var Tasks = function() {
        var nudge = function() {
            setTimeout(function() {
                window.scrollTo(0, 0);
            }, 1000);
        }
        var jump = function() {
            switch (location.hash) {
                case '#add':
                    document.body.className = 'add';
                    break;
                case '#settings':
                    document.body.className = 'settings';
                    break;
                default:
                    document.body.className = 'list';
            }
            nudge();
        }
        jump();
        window.addEventListener('hashchange', jump, false);
        window.addEventListener('orientationchange', nudge, false);

        // Lendo dados em LocalStorage
        var localStorageAvailable = ('localStorage' in window);

        var loadSettings = function() {

            if (localStorageAvailable) {
                var name = localStorage.getItem('name'), // name é o nome que vai ficar no painel

                    colorScheme = localStorage.getItem('colorScheme'), // colorScheme é a cor que foi escolhido na configuração
                    nameDisplay = document.getElementById('user_name'),
                    nameField = document.forms.settings.name,
                    doc = document.documentElement,
                    colorSchemeField = document.forms.settings.color_scheme;

                if (name) {

                    nameDisplay.innerHTML = name + " ";

                    nameField.value = name;

                } else {
                    nameDisplay.innerHTML = 'Nota';
                    nameField.value = '';

                }

                if (colorScheme) {

                    doc.className = colorScheme.toLowerCase();
                    colorSchemeField.value = colorScheme;
                } else {


                    doc.className = 'blue';
                    colorSchemeField.value = 'Blue';
                }
            }
        }
        // Salvando dados em LocalStorage
        var saveSettings = function(e) {

            e.preventDefault();

            if (localStorageAvailable) {

                var name = document.forms.settings.name.value;

                if (name.length > 0) { // retorna o nome e quantas possuem

                    var colorScheme = document.forms.settings.color_scheme.value;

                    localStorage.setItem('name', name); // setItem criar um novo nome

                    localStorage.setItem('colorScheme', colorScheme); // setItem criar uma nova cor

                    loadSettings(); //mensagem que seus dados foram salvos

                    alert('Configuração salvas com sucesso', 'Configuração salvas');

                    location.hash = '#list'; // retornara para lista de tarefa

                } else {

                    alert('Por favor,insira seu nome', 'Erro de configuração');
                }


            } else {

                alert('O navegador não suporta localStorage', 'Erro de configuração');
            }
        }
        // Apagando dados de localStorage
        var resetSettings = function(e) { // limpe todos os dados 
            e.preventDefault();

            if (confirm('Isso apagará todos os dados. Você tem certeza?', 'Redefinir dados')) {

                if (localStorageAvailable) {

                    localStorage.clear(); // apaga todos os dados gravados
                }

                loadSettings(); // mensagem de alert que os dados serão todos apagados

                alert('Os dados do aplicativo foram redefinidos', 'Reinicialização bem sucedida');

                location.hash = '#list'; // retornara para lista de tarefa
                dropDatabase();
            }
        }
        // Conectando a UI as funções de localStorage
        loadSettings();
        document.forms.settings.addEventListener('submit', saveSettings, false);
        document.forms.settings.addEventListener('reset', resetSettings, false);

        // Detecção de recursos com objetos relacionados a banco de dados
        var indexedDB = window.indexedDB || window.webkitIndexedDB ||
            window.mozIndexedDB || window.msIndexedDB || false,
            IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange ||
            window.mozIDBKeyRange || window.msIDBKeyRange || false,
            webSQLSupport = ('openDatabase' in window);

        //  Conectando - se e configurando o Banco de Dados

        var db;

        var openDB = function() {

            if (indexedDB) {

                var request = indexedDB.open('tasks', 1),
                    upgradeNeeded = ('onupgradeneeded' in request);
                request.onsuccess = function(e) {

                    db = e.target.result;

                    if (!upgradeNeeded && db.version != '1') {
                        var setVersionRequest = db.setVersion('1');
                        setVersionRequest.onsuccess = function(e) {
                            var objectStore = db.createObjectStore('tasks', {
                                keyPath: 'id'
                            });

                            objectStore.createIndex('desc', 'descUpper', {
                                unique: false
                            });

                            loadTasks();
                        }
                    } else {
                        loadTasks();
                    }
                }

                if (upgradeNeeded) {
                    request.onupgradeneeded = function(e) {

                        db = e.target.result;

                        var objectStore = db.createObjectStore('tasks', {
                            keyPath: 'id'
                        });

                        objectStore.createIndex('desc', 'descUpper', {
                            unique: false
                        });
                    }
                }

            } else if (webSQLSupport) {

                db = openDatabase('tasks', '1.0', 'Tasks database', (5 * 1024 * 1024));

                db.transaction(function(tx) {
                    var sql = 'CREATE TABLE IF NOT EXISTS tasks (' +
                        'id INTEGER PRIMARY KEY ASC,' +
                        'desc TEXT,' +
                        
                        'inscricao_estadual TEXT,' +
                        'cnpj TEXT,' +
                        'endereco TEXT,' +
                        'bairro TEXT,' +
                        'cep TEXT,' +
                        'municipio TEXT,' +
                        'fone_fax TEXT,' +
                        'uf TEXT,' +
                        'data_emissao DATETIME,' +
                        'data_saida DATETIME,'+
                        'numero TEXT,'+
                        'vencimento TEXT,'+
                        'codigo TEXT,'+
                        'descricao_produto_servico TEXT,'+
                        'uni TEXT,'+
                        'quantidade TEXT,'+
                        'preco_uni TEXT,'+
                        'valor TEXT,'+
                        'tipo_pagamento TEXT,'+
                        'tipo,TEXT'+
                        'valor_total_nota,TEXT'+
                        'preco_total,TEXT'+

                        'complete BOOLEAN'+
                        ')';
                    tx.executeSql(sql, [], loadTasks);
                });
            }
        }

        openDB();
        // Gerando a marcação de item de tarefa

        var createEmptyItem = function(query, taskList) {

            var emptyItem = document.createElement('li'); // Procurando pelo nome do item

            if (query.length > 0) { // Procurando se existe a tarefa 

                emptyItem.innerHTML = '<div class="item_title">' +

                    'Nenhuma tarefa corresponde a sua consulta <strong>' + query + '</strong>.' +
                    '</div>';
            } else {
                emptyItem.innerHTML = '<div class="item_title">' +

                    'Nenhuma tarefa para exebir. <a href="#add">Adicione um</a>?' +
                    '</div>';
            }

            taskList.appendChild(emptyItem);
        }
        var showTask = function(task, list) {
            var newItem = document.createElement('li'),
                checked = (task.complete == 1) ? ' checked="checked"' : '';
                task.preco_total = task.quantidade * task.preco_uni;
                task.preco_total = task.preco_total + task.valor_total_nota;
            newItem.innerHTML =
                '<div class="item_complete">' +
                '<input type="checkbox" name="item_complete" ' +
                'id="chk_' + task.id + '"' + checked + '>' +
                '</div>' +
                '<div class="item_delete">' +
                '<a href="#" id="delete_' + task.id + '">Delete</a>' +
                '</div>' +
                '<div class="item_editar">' +
                '<a href="#" id="editar_' + task.id + '">Editar</a>' +
                '</div>' +
                 '<div><h3>Destinatário/Remetente</h3></div>'+

                '<div class="item_title"> Nome:' + task.desc + '</div>' +
                
                
                '<div class="item_cnpj"> CNPJ:' + task.cnpj + '</div>' +
                '<div class="item_inscricao_estadual">Inscrição-Estadual:' + task.inscricao_estadual + '</div>' +
                '<div class="item_endereco">Endereço:' + task.endereco + '</div>' +
                '<div class="item_bairro">Bairro:' + task.bairro + '</div>' +
                '<div class="item_cep">CEP:' + task.cep + '</div>' +
                '<div class="item_municipio">Municipio:' + task.municipio + '</div>'+
                '<div class="item_fone_fax">Fone/Fax:' + task.fone_fax + '</div>'+
                '<div class="item_uf">UF:' + task.uf + '</div>'+
                '<div class="item_data_emissao">Data-Emissão:' + task.data_emissao + '</div>'+
                '<div class="item_data_saida">Data-Saida:' + task.data_saida + '</div>'+
                '<div class="item_valor_total_nota">Valor-Total-Nota:' + task.valor_total_nota + '</div>'+


                '<div><h3>Fatura</h3> </div>'+
                '<div class="item_numero">Numero:' + task.numero + '</div>'+
                '<div class="item_vencimento">Vencimento:' + task.vencimento + '</div>'+
                '<div class="item_tipo">Tipo:' + task.tipo + '</div>'+
                '<div class="item_valor">Valor:' + task.valor + '</div>'+
                '<div class="item_tipo_pagamento">Tipo-Pagamento:' + task.tipo_pagamento + '</div>'+


                '<div><h3>Itens-Nota</h3></div>'+

                '<div class="item_codigo">Codigo:' + task.codigo + '</div>'+
                '<div class="item_descricao_produto_servico">Descricao-Produto-Serviço:' + task.descricao_produto_servico + '</div>'+
                '<div class="item_uni">Unidade:' + task.uni + '</div>'+
                '<div class="item_quantidade">Quantidade:' + task.quantidade + '</div>'+
                '<div class="item_preco_uni">Preço-Unitario:' + task.preco_uni + '</div>'+
                '<div class="item_preco_uni">Preço-Total:' + task.preco_total + '</div>';







            console.log(newItem.innerHTML);

            list.appendChild(newItem);

            var markAsComplete = function(e) {
                e.preventDefault();
                var updatedTask = {
                    id: task.id,
                    desc: task.desc,
                    descUpper: task.desc.toUpperCase(),
                    
                    cnpj: task.cnpj,
                    inscricao_estadual: task.inscricao_estadual,
                    endereco: task.endereco,
                    bairro: task.bairro,
                    cep: task.cep,
                    municipio: task.municipio,
                    fone_fax: task.fone_fax,
                    uf: task.uf,
                    data_emissao: task.data_emissao,
                    data_saida: task.data_saida,
                    valor_total_nota:valor_total_nota,
                    numero:task.numero,
                    vencimento:task.vencimento,
                    tipo:task.tipo,
                    valor:task.valor,
                    tipo_pagamento:task.tipo_pagamento,
                    codigo:task.codigo,
                    descricao_produto_servico:task.descricao_produto_servico,
                    uni:task.uni,
                    quantidade:task.quantidade,
                    preco_uni:task.preco_uni,
                    preco_total:task,
                    complete: e.target.checked
                };
                updateTask(updatedTask);
            }


            var remove = function(e) {

                e.preventDefault();

                if (confirm('Excluindo tarefa. Você tem certeza?', 'Excluir')) {
                    deleteTask(task.id);
                }
            }

            var editar = function(e) {

                e.preventDefault();
                editarTask(task.id);

            }

            document.getElementById('chk_' + task.id).onchange =

                markAsComplete;

            document.getElementById('delete_' + task.id).onclick = remove;
            document.getElementById('editar_' + task.id).onclick = editar;

        }

        // Pesquisando o banco de dados e exibindo as tarefas resultantes

        var loadTasks = function(q) {

            var taskList = document.getElementById('task_list'),

                query = q || '';

            taskList.innerHTML = '';

            if (indexedDB) {

                var tx = db.transaction(['tasks'], 'readonly'),

                    objectStore = tx.objectStore('tasks'),
                    cursor, i = 0;

                if (query.length > 0) {

                    var index = objectStore.index('desc'),

                        upperQ = query.toUpperCase(),

                        keyRange = IDBKeyRange.bound(upperQ, upperQ + 'z');

                    cursor = index.openCursor(keyRange);

                } else {
                    cursor = objectStore.openCursor();

                }

                cursor.onsuccess = function(e) {

                    var result = e.target.result;

                    if (result == null) return;

                    i++;

                    showTask(result.value, taskList);

                    result['continue'](); //exibe as tarefas da lista
                }

                tx.oncomplete = function(e) {

                    if (i == 0) {

                        createEmptyItem(query, taskList);
                    }
                }
            } else if (webSQLSupport) {

                db.transaction(function(tx) {

                    var sql, args = [];

                    if (query.length > 0) {

                        sql = 'SELECT * FROM tasks WHERE desc LIKE?';

                        args[0] = query + '%';
                    } else {
                        sql = 'SELECT * FROM tasks';
                    }

                    var iterateRows = function(tx, results) {

                        var i = 0,
                            len = results.rows.length;

                        for (; i < len; i++) {

                            showTask(results.rows.item(i), taskList);
                        }

                        if (len === 0) {

                            createEmptyItem(query, taskList);
                        }
                    }
                    tx.executeSql(sql, args, iterateRows);

                });
            }
        }
        // Procurando tarefas
        var searchTasks = function(e) {
            e.preventDefault();
            var query = document.forms.search.query.value; // Procurando tarefas
            if (query.length > 0) { // query é o nome da tarefa
                loadTasks(query);
            } else {
                loadTasks();
            }
        }
        document.forms.search.addEventListener('submit', searchTasks, false);

        // Adicionado novas tarefas

        var insertTask = function(e) {

            e.preventDefault();

            var desc = document.forms.add.desc.value; // des.value é o nome da tarefa

            var cnpj = document.forms.add.cnpj.value;

            var inscricaoEstadual = document.forms.add.inscricao_estadual.value;

            var endereco = document.forms.add.endereco.value;
            var bairro = document.forms.add.bairro.value;
            var cep = document.forms.add.cep.value;
            var municipio = document.forms.add.municipio.value;
            var foneFax = document.forms.add.fone_fax.value;
            var uf = document.forms.add.uf.value;
            var dataEmissao = document.forms.add.data_emissao.value;
            var valorTotalNota = document.forms.add.valor_total_nota.value;
            var dataSaida = document.forms.add.data_saida.value;
            var numero = document.forms.add.numero.value;
            var vencimento = document.forms.add.vencimento.value;
            var tipo = document.forms.add.tipo.value;
            var tipoPagamento = document.forms.add.tipo_pagamento.value;
            var valor = document.forms.add.valor.value;
            var codigo = document.forms.add.codigo.value;
            var descricaoProdutoServico = document.forms.add.descricao_produto_servico.value;
            var uni = document.forms.add.uni.value;
            var quantidade = document.forms.add.quantidade.value;
            var precoUni = document.forms.add.preco_uni.value;
            
            








            if (desc.length > 0 &&   cnpj.length > 0 && inscricaoEstadual.length > 0 && endereco.length > 0 && bairro.length > 0 && cep.length > 0 && municipio.length > 0&& foneFax.length > 0&& uf.length > 0 && dataEmissao.length > 0&& dataSaida.length >0&& valorTotalNota.length >0&& numero.length > 0 && vencimento.length >0 && tipo.length >0&& tipoPagamento.length >0 && valor.length > 0&& codigo.length > 0&& descricaoProdutoServico.length > 0&& uni.length > 0&& quantidade.length >0&& precoUni.length >0) { // mostra o nome da tarefa e diz quantas letras, e mostra a data da tarefa

                var task = {

                    id: new Date().getTime(),

                    desc: desc,

                    descUpper: desc.toUpperCase(),

                    cnpj: cnpj,

                    inscricao_estadual: inscricaoEstadual,

                    endereco: endereco,

                    bairro: bairro,

                    cep: cep,

                    municipio: municipio,

                    fone_fax: foneFax,

                    data_emissao: dataEmissao,

                    uf:uf,

                    data_saida: dataSaida,

                    valor_total_nota:valorTotalNota,

                    numero:numero,

                    vencimento:vencimento,

                    tipo:tipo,

                    tipo_pagamento:tipoPagamento,

                    valor:valor,

                    codigo:codigo,

                    descricao_produto_servico:descricaoProdutoServico,
                   
                    uni:uni, 

                    quantidade:quantidade,

                    preco_uni:precoUni,





                    complete: false
                }

                if (indexedDB) {

                    var tx = db.transaction(['tasks'], 'readwrite');

                    var objectStore = tx.objectStore('tasks');

                    var request = objectStore.add(task);

                    tx.oncomplete = updateView;

                } else if (webSQLSupport) {

                    db.transaction(function(tx) {

                        var sql = 'INSERT INTO tasks(desc,cnpj,inscricao_estadual,endereco,bairro,cep,municipio, fone_fax, uf,data_emissao,data_saida,valor_total_nota,numero,vencimento,tipo,tipo_pagamento,valor,codigo,descricao_produto_servico, uni,quantidade,preco_uni,preco_total,complete)' +

                            'VALUES (?,?,?)',

                            args = [task.desc,  task.cnpj, task.inscricao_estadual, task.endereco, task.bairro, task.cep, task.municipio, task.fone_fax, task.uf,task.data_emissao,task.data_saida,task.valor_total_nota,task.numero,task.vencimento,task.tipo,task.tipo_pagamento,task.valor,task.codigo,task.descricao_produto_servico,task.uni,task.quantidade,task.preco_uni,task.complete];

                        tx.executeSql(sql, args, updateView);
                    });
                }


            } else {
                alert('Por favor, preencha todos os campos', 'Adicionar erro de tarefa');
            }
        }

        function updateView() {
            loadTasks();
           


            alert('Tarefa adicionada com sucesso', 'Tarefa adicionada');

            document.forms.add.desc.value.value = '';

            
            document.forms.add.cnpj.value = '';

            document.forms.add.inscricao_estadual.value = '';

            document.forms.add.endereco.value = '';

            document.forms.add.bairro.value = '';

            document.forms.add.cep.value = '';

            document.forms.add.municipio.value = '';

            document.forms.add.fone_fax.value = '';

            document.forms.add.uf.value = '';

            document.forms.add.data_emissao.value = '';

            document.forms.add.data_saida.value = '';

            document.forms.add.valor_total_nota.value = '';

            document.forms.add.numero.value = '';

            document.forms.add.vencimento.value = '';

            document.forms.add.tipo.value = '';


            document.forms.add.tipo_pagamento.value = '';

            document.forms.add.valor.value = '';

            document.forms.add.codigo.value = '';
             
            document.forms.add.descricao_produto_servico.value = '';
             
            document.forms.add.uni .value = '';

            document.forms.add.quantidade .value = '';

            document.forms.add.preco_uni .value = '';

            document.forms.add.preco_total.value = '';
;


            location.hash = '#list';
        }

        document.forms.add.addEventListener('submit', insertTask, false);

        // Atualizando e excluindo tarefa

        var updateTask = function(task) {

            if (indexedDB) {

                var tx = db.transaction(['tasks'], 'readwrite');

                var objectStore = tx.objectStore('tasks');

                var request = objectStore.put(task);
            } else if (webSQLSupport) {

                var complete = (task.complete) ? 1 : 0;

                db.transaction(function(tx) {

                    var sql = 'UPDATE tasks SET complete = ? WHERE id = ?',
                        args = [complete, task.id];
                    tx.executeSql(sql, args);
                });
            }

        }



        var deleteTask = function(id) {

            if (indexedDB) {

                var tx = db.transaction(['tasks'], 'readwrite');

                var objectStore = tx.objectStore('tasks');

                var request = objectStore['delete'](id);

                tx.oncomplete = loadTasks;

            } else if (webSQLSupport) {
                db.transaction(function(tx) {

                    var sql = 'DELETE FROM tasks WHERE id =?',
                        args = [id];
                    tx.executeSql(sql, args, loadTasks);
                });
            }
        }

        var editarTask = function(id) {

            if (indexedDB) {

                var tx = db.transaction(['tasks'], 'readwrite');

                var objectStore = tx.objectStore('tasks');

                var objectStoreRequest = objectStore.get(id);

                objectStoreRequest.onsuccess = function(event) {
                    var myRecord = objectStoreRequest.result;
                    document.forms.add.cnpj.value = myRecord.cnpj;
                    document.forms.add.desc.value = myRecord.desc;
                    
                    document.forms.add.inscricao_estadual.value = myRecord.inscricao_estadual;
                    document.forms.add.endereco.value = myRecord.endereco;
                    document.forms.add.bairro.value = myRecord.bairro;
                    document.forms.add.cep.value = myRecord.cep;
                    document.forms.add.municipio.value = myRecord.municipio;
                    document.forms.add.fone_fax.value = myRecord.fone_fax;
                    document.forms.add.uf.value = myRecord.uf;
                    document.forms.add.data_emissao.value = myRecord.data_emissao;
                    document.forms.add.data_saida.value = myRecord.data_saida;
                    document.forms.add.numero.value = myRecord.numero;
                    document.forms.add.vencimento.value = myRecord.vencimento;
                    document.forms.add.tipo.value = myRecord.tipo;
                    document.forms.add.tipo_pagamento.value = myRecord.tipo_pagamento;
                    document.forms.add.valor.value = myRecord.valor;
                    document.forms.add.codigo.value = myRecord.codigo;
                    document.forms.add.descricao_produto_servico .value = myRecord.descricao_produto_servico;
                    document.forms.add.uni .value = myRecord.uni;
                    document.forms.add.quantidade .value = myRecord.quantidade;
                    document.forms.add.preco_uni .value = myRecord.preco_uni;
                    document.forms.add.valor_total_nota .value = myRecord.preco_total+ myRecord.valor_total_nota;
                    document.forms.add.preco_total .value = myRecord.quantidade * myRecord.preco_uni;



                };
            } else if (webSQLSupport) {
                db.transaction(function(tx) {

                    var sql = 'select * FROM tasks WHERE id =?',
                        args = [id];
                    tx.executeSql(sql, args, loadTasks);
                });
            }
            location.hash = '#add';
        }
        // excluindo o banco de dados

        var dropDatabase = function() {
            if (indexedDB) {
                var delDBRequest = indexedDB.deleteDatabase('tasks');
                delDBRequest.onsuccess = window.location.reload();
            } else if (webSQLSupport) {
                db.transaction(function(tx) {
                    var sql = 'DELETE FROM tasks';
                    tx.executeSql(sql, [], loadTasks);
                });
            }
        }

        // Detectando e carregando atualização automaticamente
        if ('applicationCache' in window) {
            var appCache = window.applicationCache;
            appCache.addEventListener('updateready', function() {
                appCache.swapCache();
                if (confirm('App update is available. Update now?')) {
                    w.location.reload();
                }
            }, false);
        }
    }
    window.addEventListener('load', function() {
        new Tasks();
    }, false);




})();
