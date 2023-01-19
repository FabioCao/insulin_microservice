
// Create the namespace instance
let ns = {};

// Create the model instance
ns.model = (function() {
    'use strict';

    let $event_pump = $('body');

    // Return the API
    return {
        'read': function() {
            let ajax_options = {
                type: 'GET',
                url: 'api/insulinas',
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_read_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        create: function(insulina, tipo, acao, pico, duracao) {
            let ajax_options = {
                type: 'POST',
                url: 'api/insulinas',
                accepts: 'application/json',
                contentType: 'application/json',
                //dataType: 'json',
                data: JSON.stringify({
                    'insulina': insulina,
                    'tipo': tipo,
					'acao': acao,
					'pico': pico,
					'duracao': duracao				
                })
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_create_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        update: function(insulina, tipo, acao, pico, duracao) {
            let ajax_options = {
                type: 'PUT',
                url: 'api/insulinas/' + insulina,
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    'insulina': insulina,
                    'tipo': tipo,
					'acao': acao,
					'pico': pico,
					'duracao': duracao		
                })
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_update_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        'delete': function(insulina) {
            let ajax_options = {
                type: 'DELETE',
                url: 'api/insulinas/' + insulina,
                accepts: 'application/json',
                contentType: 'plain/text'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_delete_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        }
    };
}());

// Create the view instance
ns.view = (function() {
    'use strict';

    let $insulina = $('#insulina'),
        $tipo = $('#tipo'),
		$acao = $('#acao'),
		$pico = $('#pico'),
		$duracao = $('#duracao');

    // return the API
    return {
        reset: function() {
            $insulina.val('').focus();
			$tipo.val('');
			$acao.val('');
		    $pico.val('');
		    $duracao.val('');	
        },
        update_editor: function(insulina, tipo, acao, pico, duracao) {
			$insulina.val(insulina).focus();
            $tipo.val(tipo);
            $acao.val(acao);
		    $pico.val(pico);
		    $duracao.val(duracao);
        },
        build_table: function(insulin) {
            let rows = ''

            // clear the table
            $('.conteudo table > tbody').empty();

            // did we get a insulin array?
            if (insulin) {
                for (let i=0, l=insulin.length; i < l; i++) {
                    rows += `<tr><td class="insulina">${insulin[i].insulina}</td><td class="tipo">${insulin[i].tipo}</td><td class="acao">${insulin[i].acao}</td><td class="pico">${insulin[i].pico}</td><td class="duracao">${insulin[i].duracao}</td><td>${insulin[i].timestamp}</td></tr>`;
                }
                $('table > tbody').append(rows);
            }
        },
        error: function(error_msg) {
            $('.error')
                .text(error_msg)
                .css('visibility', 'visible');
            setTimeout(function() {
                $('.error').css('visibility', 'hidden');
            }, 3000)
        }
    };
}());

// Create the controller
ns.controller = (function(m, v) {
    'use strict';

    let model = m,
        view = v,
        $event_pump = $('body'),
        $insulina = $('#insulina'),
        $tipo = $('#tipo'),
		$acao = $('#acao'),
		$pico = $('#pico'),
		$duracao = $('#duracao');	

    // Get the data from the model after the controller is done initializing
    setTimeout(function() {
        model.read();
    }, 100)

    // Validate input
    function validate(insulina, tipo, acao, pico, duracao) {
        return insulina !== "" && tipo !== "" && acao !== "" && duracao !== "";
    }

    // Create our event handlers
    $('#create').click(function(e) {
        let insulina = $insulina.val(),
            tipo = $tipo.val(),
			acao = $acao.val(),
			pico = $pico.val(),
			duracao = $duracao.val();	

        e.preventDefault();

        if (validate(insulina, tipo, acao, pico, duracao)) {
            model.create(insulina, tipo, acao, pico, duracao)
        } else {
            alert('Problema com os parâmetros: valores não informados');
        }
    });

    $('#update').click(function(e) {
        let insulina = $insulina.val(),
            tipo = $tipo.val(),
			acao = $acao.val(),
			pico = $pico.val(),
			duracao = $duracao.val();
			
        e.preventDefault();

        if (validate(insulina, tipo, acao, pico, duracao)) {
            model.update(insulina, tipo, acao, pico, duracao)
        } else {
            alert('Problema com os parâmetros: valores não informados');
        }
        e.preventDefault();
    });

    $('#delete').click(function(e) {
        let insulina = $insulina.val();

        e.preventDefault();

        if (validate('placeholder', insulina)) {
            model.delete(insulina)
        } else {
            alert('Problema com os parâmetros: insulina');
        }
        e.preventDefault();
    });

    $('#reset').click(function() {
        //location.reload();
        //model.read();
        window.location.reload();
        view.reset();
    })

    $('table > tbody').on('dblclick', 'tr', function(e) {
        let $target = $(e.target),
            insulina,
            tipo,
			acao,
			pico,
			duracao;

        insulina = $target
            .parent()
            .find('td.insulina')
            .text();
		
		tipo = $target
            .parent()
            .find('td.tipo')
            .text();

        acao = $target
            .parent()
            .find('td.acao')
            .text();
		
		pico = $target
            .parent()
            .find('td.pico')
            .text();
			
		duracao = $target
            .parent()
            .find('td.duracao')
            .text();
		
        view.update_editor(insulina, tipo, acao, pico, duracao);
    });

    // Handle the model events
    $event_pump.on('model_read_success', function(e, data) {
        view.build_table(data);
        view.reset();
    });

    $event_pump.on('model_create_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_update_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_delete_success', function(e, data) {
        model.read();
    });


    $event_pump.on('model_error', function(e, xhr, textStatus, errorThrown) {
        let error_msg = "Msg de Erro:" + textStatus + ': ' + errorThrown + ' - ' + xhr.responseJSON.detail;
        view.error(error_msg);
        console.log(error_msg);
    })
}(ns.model, ns.view));