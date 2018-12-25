define(['socket'], function(socket) {
    var arrow_bar_tpl = '<div class="arrow_box"></div>';
    var status_tpl = '<div class="health_bar progress_bar"><div id="{0}" class="hp_value"></div></div><div class="progress_bar regen_bar"><div id="{1}" class="regen_value"></div></div>';

    socket.on('acquired_item', function(coordinates){
        var x_distance = coordinates[0]-game.player_buffer[game.player_id]['fgx'];
        var y_distance = coordinates[1]-game.player_buffer[game.player_id]['fgy'];
        var sound_noise = 0;

        if(x_distance < 25 || -x_distance < 25){
            sound_noise += (x_distance/2);
        } else if(y_distance < 25 || -y_distance < 25){
            sound_noise += (y_distance/2);
        }

        if (sound_noise) {
            var pickup_sound = game.sounds['pickup'];
            pickup_sound.setVolume(Math.min(sound_noise, 100)).play();
        }

        game.map[coordinates[0]][coordinates[1]] = 0;
        delete game.items[coordinates[0]+':'+coordinates[1]];
    });

    socket.on('update_players', function(players){
        for(id in players){
            if(typeof game.player_buffer[id] == 'undefined'){
                console.log('adding new', id);
                var player_arrow_box = $(arrow_bar_tpl);
                player_arrow_box.attr('id', id);

                var new_format = status_tpl.format('hp_value_'+id, 'regen_value_'+id);
                player_arrow_box.append($(new_format));

                $('#arrow_boxes').append(player_arrow_box);

                game.player_hp_bars[id] = $('#hp_value_'+id)[0].style;
                game.player_re_bars[id] = $('#regen_value_'+id)[0].style;
                game.player_bars[id] = $(player_arrow_box)[0].style;

                game.default_data['id'] = id;
                game.player_buffer[id] = game.default_data;
            }
        }

        $('#player_ids').html('There are '+Object.keys(players).length+' users actively playing');

        socket.on('healed', function(){
            $('#hp').html(game.player_buffer[game.player_id]['hp']+'/20');
        })


        var dead = false;
        socket.on('damage', function (data) {
            if (dead) return false;
            game.player_buffer[game.player_id]['hp'] = (game.player_buffer[game.player_id]['hp']-data.attack);

            if (game.player_buffer[game.player_id]['hp'] <= 0) {
                dead = true;
                alert('You died! ):');
                document.location.reload(true);
            }

            game.local_data[game.player_id].attack_flash = 20;
            $('#hp').html(game.player_buffer[game.player_id]['hp']+'/20');

            if (game.player_buffer[game.player_id].dir == 'l') {
                game.local_data[game.player_id].queue.x = -data.recoil;
            } else {
                game.local_data[game.player_id].queue.x = data.recoil;
            }
        });

        socket.on('defeat_character', function (defeated_player_id) {
            // game.local_data[game.player_id].re_overwrite = (300-1);
            game.player_buffer[game.player_id]['hp'] = 20;
            game.player_buffer[game.player_id]['re'] = 300-1;
            $('#hp').html(game.player_buffer[game.player_id]['hp']+'/20');
        });

        socket.on('remove_player', function (id) {
            $('#arrow_boxes > #'+id).remove();
            delete game.player_buffer[id];
        });

        socket.on('hotswap', function (data) {
            console.log(data);
            // document.location.reload(true);
        });

        socket.on('update_data', function (obj) {
            var players = obj.p;
            game.monster_buffer = obj.m;

            delete players[game.player_id];
            var keys = Object.keys(players), len = keys.length, i = 0;

            while(i = keys.pop()) {
                var reverse_y = game.height-players[i].y;
                var x_draw_limit = (players[i].x+game.sprite_data._w > game.local_data[game.player_id].xcam && players[i].x < game.local_data[game.player_id].xcam+game.visible_width);
                var y_draw_limit = (reverse_y+game.sprite_data._h > game.local_data[game.player_id].ycam && reverse_y-game.sprite_data._h < game.local_data[game.player_id].ycam+game.visible_height);

                if (y_draw_limit && x_draw_limit) {
                    game.player_bars[i].left = (players[i].x-game.local_data[game.player_id].xcam)+'px';
                } else {
                    game.player_bars[i].left = (game.width+120)+'px';
                }

                game.player_buffer[i]['relevant_view'] = (y_draw_limit && x_draw_limit);
                game.player_buffer[i] = players[i];
                game.player_hp_bars[i].width = ~~(100*(players[i].hp/20))+'%';
                game.player_re_bars[i].width = ~~(100*(players[i].re/300))+'%';
            }
        });
    });
});
