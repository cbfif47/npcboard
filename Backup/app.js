var todomvc = angular.module('todomvc', ['firebase']);


todomvc.controller('TodoCtrl', function TodoCtrl($scope, $firebase, $firebaseAuth) {
    var ref = new Firebase('https://npcboard.firebaseio.com/');	
    auth = $firebaseAuth(ref);
    $scope.todos = null;
    $scope.newTodo = '';
    $scope.editedTodo = null;
    var authData = null;
    var fireRef = new Firebase('https://npcboard.firebaseio.com/todos/');

    $scope.login = function() {
      var ref = new Firebase("https://npcboard.firebaseio.com");
	  ref.authWithOAuthRedirect("google", function(error) {
        if (error) {
        console.log("Login Failed!", error);
        } else {
    // We'll never get here, as the page will redirect on success.
        }
      });
    };
    // This toggles between logged in or not and gets called whenever that state changes
    function authDataCallback(authData) {
      if (authData) {
        console.log("User " + authData.uid + " is logged in with " + authData.provider);
        var user_id = authData.uid;
        $scope.showlogin = false;
        fireRef = new Firebase('https://npcboard.firebaseio.com/todos/'+user_id);
        $scope.todos = $firebase(fireRef.orderByChild("priority")).$asArray();      } else {
        console.log("User is logged out");
        fireRef = new Firebase('https://npcboard.firebaseio.com/todos/');
        $scope.todos = null;
        $scope.showlogin = true;
      }
    }
    // Register the callback to be fired every time auth state changes
    ref.onAuth(authDataCallback);

	//count todos
	$scope.$watch('todos', function(){
		var total = 0;
		var remaining = 0;
		$scope.todos.forEach(function(todo){
			total++;
			if (todo.status == 'pending') {
				remaining++;
			}else if (todo.status == 'new') {
				remaining++;
			}
		});
		$scope.totalCount = total;
		$scope.remainingCount = remaining;
		$scope.allChecked = remaining === 0;
	}, true);

	$scope.addTodo = function(){
		var newTodo = $scope.newTodo.trim();
		if (!newTodo.length) {
			return;
		}
		// push to firebase if it has a length
		$scope.todos.$add({
			title: newTodo,
			status: 'new'
		});
		$scope.newTodo = '';
	};

	$scope.editTodo = function(todo){
		$scope.editedTodo = todo;
		$scope.originalTodo = angular.extend({}, $scope.editedTodo);
	};

	// update todo for changes we made
	$scope.doneEditing = function(todo){
		$scope.editedTodo = null;
		var title = todo.title.trim();
		if (title) {
			$scope.todos.$save(todo);
		} else {
			$scope.removeTodo(todo);
		}
	};

	$scope.removeTodo = function(todo){
	  $scope.todos.$remove(todo);
	};

	// delete all todos that have been completed
	$scope.clearCompletedTodos = function(){
		angular.forEach($scope.todos, function(todo){
			if (todo.status == "completed"){
				todo.status = 'archived';
                		$scope.todos.$save(todo);
			}
		});
	};

        // change status
	$scope.statusTodo = function(todo, newStat){
		todo.status = newStat;
                $scope.todos.$save(todo);
	};
	
	// complete and log completed date
	$scope.completeTodo = function(todo){
		todo.status = "completed";
		todo.donedate = Date.now();
                $scope.todos.$save(todo);
	};

        // set to top priority
	$scope.topPriority = function(todo,stat){
            var items = $scope.todos.filter(filterStatus(stat)).reverse();
		for (i = 0; i < 1; i++) {
	          var top = items[i].priority;
		  if(top === undefined) {top = 0;};
		  console.log(top);
                }
		todo.priority = top + 1;
                $scope.todos.$save(todo);
	};

        // set to bottom priority
	$scope.bottomPriority = function(todo,stat){
            var items = $scope.todos.filter(filterStatus(stat));
		for (i = 0; i < 1; i++) {
	          var bottom = items[i].priority;
		  if(bottom == undefined) {bottom = 0;};
		  console.log(bottom);
                }
		todo.priority = bottom - 1;
                $scope.todos.$save(todo);
	};

	function filterStatus(stat)  {
		return function(item) {
		  var test = item.status === stat ;
		  return test;
		}
	}

	
});



// TODO focus and blur directives
todomvc.directive('todoFocus', function todoFocus($timeout){
	return function(scope, elem, attrs){
		scope.$watch(attrs.todoFocus, function(newVal){
			if (newVal){
				$timeout(function(){
					// sets focus to edit input field
					elem[0].focus();
				}, 0, false);
			}
		});
	};
});

todomvc.directive('todoBlur', function () {
	return function (scope, elem, attrs) {
		elem.bind('blur', function(){
			// run function we pass in to attribute on blur
			scope.$apply(attrs.todoBlur);
		});
	};
});

todomvc.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});