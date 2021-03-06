// Browser-Side!
var SnakePit = require('./snake_pit/index.js'),
    Game = SnakePit.Game;


angular.module('snakePitApp', [])
.controller('gameCtrl', [
  '$scope',
  function($scope){
    $scope.queue = [];
    $scope.player = {};
    var socket = io.connect('http://localhost:3000/');

    socket.on('me', function(player){
      $scope.player = player;
    });

    socket.on('pool', function(data){
      $scope.queue = data;
      $scope.$digest();
    });

    socket.on('game_start', function(data){

      var handleSnakeControl = function(snake) {
        if(snake.id == $scope.player.id) {
          SnakePit.KeyboardControllable.call(snake, viewport, socket);
        }
        else {
          SnakePit.Controllable.call(snake, socket, false);
        }

        snake.on('death', function(){
          game.snakes = game.snakes.filter(function(s){ return s != snake }); // Remove the snake from the game
        })
      }



      data.config.viewport = viewport;
      var game = Game.fromState(data);
      $scope.game = game;

      $scope.players = game.snakes;

      data.snakes.forEach(function(s){
        snake = game.addPlayer(s, {x: s.x, y: s.y, color: s.color});
        handleSnakeControl(snake);
      })

      data.snakes.forEach(handleSnakeControl);

      socket.on('game_sync', function(data){
        game.sync(data);
      });

      socket.on('add_player', function(data){
        handleSnakeControl(game.addPlayer(data.player, data.placement));
      });

      socket.on('remove_player', function(data){
        game.snakes = game.snakes.filter(function(s){ return s.id != data.id }); // Remove the snake from the game
      });

      game.run();
    });

    $scope.joinQueue = function(){
      var player = {name: $scope.playerName};
      // $scope.queue.push(player);
      $scope.inQueue = true;
      socket.emit('join_pool', player);
    }
  }
])
