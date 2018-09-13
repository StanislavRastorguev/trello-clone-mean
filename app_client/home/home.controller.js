(() => {

  angular
    .module('trelloClone')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['boardData', 'listData', 'taskData', 'attachmentData', '$timeout', '$state', 'authentication', 'messageFactory', '$window', '$location', 'socketioFactory', '$scope'];
  function homeCtrl(boardData, listData, taskData, attachmentData, $timeout, $state, authentication, messageFactory, $window, $location, socketioFactory, $scope) {
    let vm = this;

    vm.params = $location.search();
    vm.taskEditModal = false;
    vm.taskEdit = false;

    //get jwt and user information from url, after user authentication with social networks
    if (vm.params.token) {
      $window.localStorage['trello-clone'] = vm.params.token;
      let userInfo = authentication.getShortUserName(vm.params.name);
      $window.localStorage['trello-clone-user-name'] = userInfo.name;
      $window.localStorage['trello-clone-short-user-name'] = userInfo.shortName;
      $state.go('home');
      $location.search('token', null);
      $location.search('name', null);
    }

    //delete user info from local storage
    vm.logout = () => {
      authentication.logout();
      vm.isLoggedIn = false;
    };

    //check user authentication
    vm.authenticationCheck = () => {
      vm.isLoggedIn = authentication.isLoggedIn();

      //send information in pageHeader.controller, for update user info
      if (!vm.isLoggedIn && authentication.getToken()){
        $scope.$emit('userAuth', 'token expired');
      }
    };

    //counter for date time picker
    (vm.updateCounter = () => {
      vm.newDate = new Date();
      vm.dateNow = vm.newDate.toISOString();
      vm.nextDay = vm.newDate;
      vm.nextDay.setDate(vm.newDate.getDate()+1);
      vm.nextDay = vm.nextDay.toISOString();
      $timeout(vm.updateCounter, 1000);
    })();

    //get board information
    (vm.getBoardData = () => {
      boardData.board()
        .then((boardData) => {
          const {color, lists, _id} = boardData.data[0];
          vm.boardColor = color;
          vm.lists = lists;
          vm.boardID = _id;
        })
        .catch(() => {
          vm.message = 'Не удалось загрузить доску.';
        })
    })();

    //array of colors for update board
    vm.colors = ['#0079BF', '#D29034', '#519839', '#B04632', '#89609E', '#CD5A91', '#4BBF6B', '#00AECC', '#838C91'];

    //function for send board information between users
    socketioFactory.on('boardClient', (data) => {
      vm.lists = data.lists;
      vm.boardColor = data.boardColor;
    });

    //function for send list information in modal window between users
    socketioFactory.on('modalListClient', (data) => {
      if (data.modalList && vm.modalList) {
        if (data.modalList._id === vm.modalList._id) {
          vm.modalList = data.modalList;
          vm.modalListIndex = data.modalListIndex;
        }
      }
    });

    //function for send task information in modal window between users
    socketioFactory.on('modalTaskClient', (data) => {
      if (data.modalTask && vm.modalTask) {
        if (data.modalTask._id === vm.modalTask._id) {
          vm.modalList = data.modalList;
          vm.modalListIndex = data.modalListIndex;
          vm.modalTask = data.modalTask;
          vm.modalTaskIndex = data.modalTaskIndex;
          vm.editedTaskName = vm.modalTask.taskName;
          vm.listNameForTask = vm.modalList.listName;
        }
      }
    });

    //function for find list index
    let foundListIndex = (listId, callback) => {
      for (let i = 0; i < vm.lists.length; i++) {
        if (vm.lists[i]._id === listId) {
          callback({ listIndex: i })
        }
      }
    };

    //function for find task index
    let foundTaskIndex = (taskId, callback) => {
      for (let i = 0; i < vm.lists.length; i++) {
        for (let j = 0; j < vm.lists[i].tasks.length; j++){
          if (vm.lists[i].tasks[j]._id === taskId) {
            callback({
              listIndex: i,
              taskIndex: j
            });
          }
        }
      }
    };

    //message if list was delete by another user
    let deletedList = () => {
      vm.message = 'Список удалили.';
      vm.taskEditModal = false;
      vm.taskEdit = false;
    };

    //message if task was delete by another user
    let deletedTask = () => {
      vm.message = 'Карточку удалили.';
      vm.taskEditModal = false;
      vm.taskEdit = false;
    };

    //function for check list index, if it exist
    let checkListPosition = (listIndex, list) => {
      return new Promise((resolve, reject) => {

        if (!list._id) {
          reject({ message: 'list not found' });
        }

        if (!vm.lists[listIndex]) {
          foundListIndex(list._id, (data) => {
            listIndex = data.listIndex
          });
          if (!vm.lists[listIndex] || !vm.lists[listIndex]._id) {
            reject({ message: 'list not found' });
          }
        }

        if (list._id !== vm.lists[listIndex]._id) {
          foundListIndex(list._id, (data) => {
            listIndex = data.listIndex
          });

          if (vm.lists[listIndex] === undefined || vm.lists[listIndex]._id !== list._id) {
            reject({ message: 'list not found' });
          }
        }

        resolve({ listIndex: listIndex })

      })
    };

    //function for check task index, if it exist
    let checkTaskPosition = (listIndex, taskIndex, list, task) => {
      return new Promise((resolve, reject) => {

        if (!task._id) {
          reject({ message: 'task not found' });
        }

        let taskId = task._id;
        if (!vm.lists[listIndex] || !vm.lists[listIndex].tasks[taskIndex]) {

          foundTaskIndex(taskId, (data) => {
            listIndex = data.listIndex;
            taskIndex = data.taskIndex;
          });
          if (!vm.lists[listIndex]) {
            reject({ message: 'list not found' });
          }
          if (!vm.lists[listIndex].tasks[taskIndex] || !vm.lists[listIndex].tasks[taskIndex]._id) {
            reject({ message: 'task not found' });
          }
        }

        let taskIdForEdit = vm.lists[listIndex].tasks[taskIndex]._id;
        if (taskId !== taskIdForEdit) {
          foundTaskIndex(taskId, (data) => {
            listIndex = data.listIndex;
            taskIndex = data.taskIndex;
          });

          if (vm.lists[listIndex] === undefined) {
            reject({ message: 'list not found' });
          }
          if (vm.lists[listIndex].tasks[taskIndex] === undefined || vm.lists[listIndex].tasks[taskIndex]._id !== taskId) {
            reject({ message: 'task not found' });
          }
        }

        resolve({
          listIndex: listIndex,
          taskIndex: taskIndex
        })
      });
    };

    //update board information
    vm.updateBoard = (color, lists) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!color) {
        color = vm.boardColor;
      }
      if (!lists) {
        lists = vm.lists;
      }
      let boardDataForUpdate = {"lists": lists, "color": color};

      //send request to boardData.service, updateBoard function
      boardData.updateBoard(vm.boardID, boardDataForUpdate)
        .then((newBoardData) => {
          let {color, lists} = newBoardData.data;
          vm.boardColor = color;
          vm.lists = lists;

          //send board information to another users
          socketioFactory.emit('boardServer', { boardColor: vm.boardColor, lists: vm.lists });
        })
        .catch((err) => {
          if (err.status === 401) {
            messageFactory.message = 'Войдите в учётную запись для продолжения.';
            vm.logout();
          } else {
            vm.message = 'Не удалось сохранить данные.';
          }
        })

    };

    //update lists position by drag and drop
    vm.dndList = (listIndex, list) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }

      //check list index, send to another users and update board
      checkListPosition(listIndex, list)
        .then((data) => {
          listIndex = data.listIndex;
          socketioFactory.emit('modalListServer', {
            modalList: vm.lists[listIndex],
            modalListIndex: listIndex
          });
          vm.updateBoard(vm.boardColor, vm.lists);
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

    //update lists position
    vm.updateListPosition = (listIndex, newListIndex, list) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }

      //check list index, send to another users and update board
      checkListPosition(listIndex, list)
        .then((data) => {
          listIndex = data.listIndex;
          vm.lists.splice(listIndex, 1);
          vm.lists.splice(newListIndex, 0, list);
          socketioFactory.emit('modalListServer', {
            modalList: vm.lists[listIndex],
            modalListIndex: listIndex
          });
          vm.updateBoard(vm.boardColor, vm.lists);
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

    //create list
    vm.createList = (listName) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!listName || listName === '') {
        vm.message = 'Введите имя списка.';
        return;
      }

      vm.message = '';
      listName.replace(/^\s+|\s+$/g, '');
      let nameForCreate = {'listName': listName};

      //send request to listData.service, createList function
      listData.createList(vm.boardID, nameForCreate)
        .then((listData) => {
          //add list on the board and send info to another users
          vm.lists.push(listData.data);
          socketioFactory.emit('boardServer', { boardColor: vm.boardColor, lists: vm.lists });
        })
        .catch((err) => {
          if (err.status === 401) {
            messageFactory.message = 'Войдите в учётную запись для продолжения.';
            vm.logout();
          } else {
            vm.message = 'Не удалось создать список.';
          }
        })

    };

    //update list information
    vm.updateList = (list, listIndex, newListName) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }
      const {_id: listid, listName} = list;
      if (newListName === listName) {
        return;
      } else if (!newListName || newListName === '') {
        vm.message = 'Введите имя списка.';
        return;
      }
      vm.message = '';
      newListName.replace(/^\s+|\s+$/g, '');
      newListName ? list.listName = newListName : list.listName;
      let nameForUpdate = {'listName': newListName};

      //check list index
      checkListPosition(listIndex, list)
        .then((data) => {
          listIndex = data.listIndex;

          //send request to listData.service, updateList function
          listData.updateList(vm.boardID, listid, nameForUpdate)
            .then((newList) => {

              //update information and send to another users to board and in modal window
              vm.lists[listIndex].listName = newList.data.listName;
              socketioFactory.emit('modalListServer', {
                modalList: vm.lists[listIndex],
                modalListIndex: listIndex
              });
              socketioFactory.emit('boardServer', { boardColor: vm.boardColor, lists: vm.lists });
            })
            .catch((err) => {
              if (err.status === 401) {
                messageFactory.message = 'Войдите в учётную запись для продолжения.';
                vm.logout();
              } else {
                vm.message = 'Не удалось изменить имя списка.';
              }
            })
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

    //delete list
    vm.deleteList = (list, index) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }

      const {_id: listid} = list;

      //send request to listData.service, deleteList function, update information and send to another users
      listData.deleteList(vm.boardID, listid)
        .then(() => {
          vm.lists.splice(index, 1);
          socketioFactory.emit('boardServer', { boardColor: vm.boardColor, lists: vm.lists });
        })
        .catch((err) => {
          if (err.status === 401) {
            messageFactory.message = 'Войдите в учётную запись для продолжения.';
            vm.logout();
          } else {
            vm.message = 'Не удалось удалить список.';
          }
        })

    };

    //create task
    vm.createTask = (list, index, taskName, side) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }
      if (!taskName || taskName.length === 0) {
        vm.message = 'Введите имя карточки';
        return;
      }

      vm.message = '';
      taskName.replace(/^\s+|\s+$/g, '');
      let taskNameForCreate = {'taskName': taskName, 'side': side};
      const {_id: listid, tasks} = list;

      //send request to taskData.service, createTask function, update information and send to another users
      taskData.createTask(vm.boardID, listid, taskNameForCreate)
        .then((taskData) => {
          if (side === 'top') {
            tasks.unshift(taskData.data);
            socketioFactory.emit('boardServer', { boardColor: vm.boardColor, lists: vm.lists });
          } else {
            tasks.push(taskData.data);
            socketioFactory.emit('boardServer', { boardColor: vm.boardColor, lists: vm.lists });
          }
        })
        .catch((err) => {
          if (err.status === 401) {
            messageFactory.message = 'Войдите в учётную запись для продолжения.';
            vm.logout();
          } else {
            vm.message = 'Не удалось создать карточку.';
          }
        })

    };

    //update tasks position by drag and drop
    vm.dndTask = (listIndex, taskIndex, list, task) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }
      if (!task._id) {
        deletedTask();
        return;
      }

      //check tasks position
      checkTaskPosition(listIndex, taskIndex, list, task)
        .then((data) => {
          listIndex = data.listIndex;
          taskIndex = data.taskIndex;

          //send information to another users and update board
          socketioFactory.emit('modalTaskServer', {
            modalList: vm.lists[listIndex],
            modalListIndex: listIndex,
            modalTask: vm.lists[listIndex].tasks[taskIndex],
            modalTaskIndex: taskIndex,
          });
          vm.updateBoard(vm.color, vm.lists);
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else if (err.message === 'task not found') {
            deletedTask();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

    //update task position
    vm.updateTaskPosition = (thisListIndex, thisTaskIndex, newListIndex, newTaskIndex, list, task) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }
      if (!task._id) {
        deletedTask();
        return;
      }

      //check tasks position
      checkTaskPosition(thisListIndex, thisTaskIndex, list, task)
        .then((data) => {
          thisListIndex = data.listIndex;
          thisTaskIndex = data.taskIndex;
          let thisTask = vm.lists[thisListIndex].tasks.splice(thisTaskIndex, 1);
          vm.lists[newListIndex].tasks.splice(newTaskIndex, 0, thisTask[0]);
          vm.listNameForTask = vm.lists[newListIndex].listName;

          //send information to another users and update board
          socketioFactory.emit('modalTaskServer', {
            modalList: vm.lists[newListIndex],
            modalListIndex: newListIndex,
            modalTask: vm.modalTask,
            modalTaskIndex: newTaskIndex,
          });
          vm.updateBoard(vm.boardColor, vm.lists);
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else if (err.message === 'task not found') {
            deletedTask();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

    //update task information
    vm.updateTask = (list, task, newTaskData) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }
      if (!task._id) {
        deletedTask();
        return;
      }

      //send request to taskData.service, updateTask function, update information
      taskData.updateTask(vm.boardID, list._id, task._id, newTaskData)
        .then((newTaskData) => {
          const { taskName, description, date, status } = newTaskData.data;
          if (task._id === newTaskData.data._id) {
            task.date = date;
            task.description = description;
            task.taskName = taskName;
            task.status = status;
            vm.modalTask.date = date;
            vm.modalTask.description = description;
            vm.modalTask.taskName = taskName;
            vm.modalTask.status = status;
          }

          //send information to another users in modal window and on the board
          socketioFactory.emit('modalTaskServer', {
            modalList: vm.modalList,
            modalListIndex: vm.modalListIndex,
            modalTask: vm.modalTask,
            modalTaskIndex: vm.modalTaskIndex
          });
          socketioFactory.emit('boardServer', { boardColor: vm.boardColor, lists: vm.lists });
        })
        .catch((err) => {
          if (err.status === 401) {
            messageFactory.message = 'Войдите в учётную запись для продолжения.';
            vm.logout();
          } else {
            vm.message = 'Не удалось обновить карточку.';
          }
        })

    };

    //date, time picker for task
    vm.dateTimePicker = (listIndex, taskIndex, list, task) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }
      if (!task._id) {
        deletedTask();
        return;
      }

      //check task position and update task information
      checkTaskPosition(listIndex, taskIndex, list, task)
        .then((data) => {
          listIndex = data.listIndex;
          taskIndex = data.taskIndex;
          let newDueDate = vm.now,
            date = vm.taskDate,
            time = vm.taskTime;
          if (date !== null) {
            newDueDate.setFullYear(date.getFullYear());
            newDueDate.setMonth(date.getMonth());
            newDueDate.setDate(date.getDate());
          }
          if (time !== null) {
            newDueDate.setHours(time.getHours());
            newDueDate.setMinutes(time.getMinutes());
          }
          let listForUpdate = vm.lists[listIndex],
            taskForUpdate = listForUpdate.tasks[taskIndex],
            taskDataForUpdate = {
              taskName: taskForUpdate.taskName,
              description: taskForUpdate.description,
              date: newDueDate,
              status: taskForUpdate.status
            };
          vm.updateTask(listForUpdate, taskForUpdate, taskDataForUpdate);
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else if (err.message === 'task not found') {
            deletedTask();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

    //remove due date for task
    vm.dateTimeRemove = (listIndex, taskIndex, list, task) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }
      if (!task._id) {
        deletedTask();
        return;
      }

      //check task position and update task information
      checkTaskPosition(listIndex, taskIndex, list, task)
        .then((data) => {
          listIndex = data.listIndex;
          taskIndex = data.taskIndex;
          let listForUpdate = vm.lists[listIndex],
            taskForUpdate = listForUpdate.tasks[taskIndex],
            taskDataForUpdate = {
              taskName: taskForUpdate.taskName,
              description: taskForUpdate.description,
              date: null,
              status: taskForUpdate.status
            };
          vm.updateTask(listForUpdate, taskForUpdate, taskDataForUpdate);
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else if (err.message === 'task not found') {
            deletedTask();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

    //update task name
    vm.updateTaskName = (listIndex, taskIndex, list, task, newTaskName) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }
      if (!task._id) {
        deletedTask();
        return;
      }

      //check task position and update task information
      checkTaskPosition(listIndex, taskIndex, list, task)
        .then((data) => {
          listIndex = data.listIndex;
          taskIndex = data.taskIndex;
          let listForUpdate = vm.lists[listIndex],
            taskForUpdate = listForUpdate.tasks[taskIndex],
            taskDataForUpdate = {
              taskName: newTaskName,
              description: taskForUpdate.description,
              date: taskForUpdate.date,
              status: taskForUpdate.status
            };
          vm.updateTask(listForUpdate, taskForUpdate, taskDataForUpdate);
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else if (err.message === 'task not found') {
            deletedTask();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

    //update task description
    vm.updateTaskDescription = (listIndex, taskIndex, list, task, newTaskDescription) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }
      if (!task._id) {
        deletedTask();
        return;
      }

      //check task position and update task information
      checkTaskPosition(listIndex, taskIndex, list, task)
        .then((data) => {
          listIndex = data.listIndex;
          taskIndex = data.taskIndex;
          let listForUpdate = vm.lists[listIndex],
            taskForUpdate = listForUpdate.tasks[taskIndex],
            taskDataForUpdate = {
              taskName: taskForUpdate.taskName,
              description: newTaskDescription,
              date: taskForUpdate.date,
              status: taskForUpdate.status
            };
          vm.updateTask(listForUpdate, taskForUpdate, taskDataForUpdate);
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else if (err.message === 'task not found') {
            deletedTask();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

    //update task status
    vm.updateTaskStatus = (listIndex, taskIndex, list, task, newTaskStatus) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }
      if (!task._id) {
        deletedTask();
        return;
      }

      //check task position and update task information
      checkTaskPosition(listIndex, taskIndex, list, task)
        .then((data) => {
          listIndex = data.listIndex;
          taskIndex = data.taskIndex;
          let listForUpdate = vm.lists[listIndex],
            taskForUpdate = listForUpdate.tasks[taskIndex],
            taskDataForUpdate = {
              taskName: taskForUpdate.taskName,
              description: taskForUpdate.description,
              date: taskForUpdate.date,
              status: newTaskStatus
            };
          vm.updateTask(listForUpdate, taskForUpdate, taskDataForUpdate);
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else if (err.message === 'task not found') {
            deletedTask();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

    //delete task
    vm.deleteTask = (list, listIndex, task, taskIndex) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }
      if (!task._id) {
        deletedTask();
        return;
      }

      //check task position and update task information
      checkTaskPosition(listIndex, taskIndex, list, task)
        .then((data) => {
          listIndex = data.listIndex;
          taskIndex = data.taskIndex;
          let listid = vm.lists[listIndex]._id,
            taskid = vm.lists[listIndex].tasks[taskIndex]._id;
          taskData.deleteTask(vm.boardID, listid, taskid)
            .then(() => {
              vm.lists[listIndex].tasks.splice(taskIndex, 1);

              //send information on the board to another users
              socketioFactory.emit('boardServer', { boardColor: vm.boardColor, lists: vm.lists });
            })
            .catch((err) => {
              if (err.status === 401) {
                messageFactory.message = 'Войдите в учётную запись для продолжения.';
                vm.logout();
              } else {
                vm.message = 'Не удалось удалить карточку.';
              }
            })
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else if (err.message === 'task not found') {
            deletedTask();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

    //upload task attachment
    vm.uploadAttachment = (evt, listIndex, taskIndex, list, task) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }
      if (!task._id) {
        deletedTask();
        return;
      }

      //check task position, get some information and replace form for upload next files
      checkTaskPosition(listIndex, taskIndex, list, task)
        .then((data) => {
          listIndex = data.listIndex;
          taskIndex = data.taskIndex;
          let inputElement = angular.element(document.querySelector('#file')),
            inputElementMobile = angular.element(document.querySelector('#fileMobile'));
          let file;
          if (inputElement[0].files[0]) {
            file = inputElement[0].files[0];
          } else {
            file = inputElementMobile[0].files[0];
          }
          let listName = vm.lists[listIndex].listName,
            listid = vm.lists[listIndex]._id,
            taskName = vm.lists[listIndex].tasks[taskIndex].taskName,
            taskid = vm.lists[listIndex].tasks[taskIndex]._id;
          inputElement.replaceWith("<input type=\"file\" id=\"file\" name=\"fileName\" accept=\".jpg, .jpeg, .png, .bmp\" onchange=\"angular.element(event.target.form).triggerHandler('submit');\"/>");
          inputElementMobile.replaceWith("<input type=\"file\" id=\"fileMobile\" name=\"fileName\" accept=\".jpg, .jpeg, .png, .bmp\" onchange=\"angular.element(event.target.form).triggerHandler('submit');\"/>");

          //send request to attachmentData.service, addAttachment function
          attachmentData.addAttachment(vm.boardID, listid, taskid, file, listName, taskName)
            .then((attachmentData) => {
              let { message } = attachmentData.data;
              vm.alertFileUpload = 'alert alert-danger';
              switch (message) {
                case 'LIMIT_FILE_SIZE':
                  vm.fileUploaderMessage = 'Допустимый размер файла до 10 МБ.';
                  break;
                case 'FILE_TYPE':
                  vm.fileUploaderMessage = 'Допустимый формат файла jpeg, bmp, png.';
                  break;
                case 'FILE_WAS_NOT_UPLOADED':
                  vm.fileUploaderMessage = 'Не удалось загрузить файл.';
                  break;
                case 'FILE_WAS_NOT_SELECTED':
                  vm.fileUploaderMessage = 'Файл не был выбран.';
                  break;
                  //update information and send to another users to the modal window and on the board
                default:
                  vm.alertFileUpload = 'alert alert-success';
                  vm.fileUploaderMessage = 'Файл загружен!';
                  vm.lists[listIndex].tasks[taskIndex].attachments.push(attachmentData.data);
                  vm.modalTask.attachments = vm.lists[listIndex].tasks[taskIndex].attachments;
                  socketioFactory.emit('modalTaskServer', {
                    modalList: vm.modalList,
                    modalListIndex: vm.modalListIndex,
                    modalTask: vm.modalTask,
                    modalTaskIndex: vm.modalTaskIndex
                  });
                  socketioFactory.emit('boardServer', { boardColor: vm.boardColor, lists: vm.lists });
              }
            })
            .catch((err) => {
              if (err.status === 401) {
                messageFactory.message = 'Войдите в учётную запись для продолжения.';
                vm.logout();
              } else {
                vm.alertFileUpload = 'alert alert-danger';
                vm.fileUploaderMessage = 'Не удалось загрузить файл.';
              }
            })
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else if (err.message === 'task not found') {
            deletedTask();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

    //delete task attachment
    vm.deleteAttachment = (listIndex, taskIndex, list, task, attachmentIndex, attachment) => {

      if (!authentication.isLoggedIn()) {
        messageFactory.message = 'Войдите в учётную запись для продолжения.';
        $state.go('login');
        return;
      }
      if (!list._id) {
        deletedList();
        return;
      }
      if (!task._id) {
        deletedTask();
        return;
      }

      //check task position
      checkTaskPosition(listIndex, taskIndex, list, task)
        .then((data) => {
          listIndex = data.listIndex;
          taskIndex = data.taskIndex;

          if (!vm.lists[listIndex].tasks[taskIndex].attachments || !vm.lists[listIndex].tasks[taskIndex].attachments[attachmentIndex]) {
            return;
          }

          let listid = vm.lists[listIndex]._id,
            taskid = vm.lists[listIndex].tasks[taskIndex]._id,
            attachmentid = vm.lists[listIndex].tasks[taskIndex].attachments[attachmentIndex]._id;

          if (attachmentid !== attachment._id) {
            for (let i = 0; i < vm.lists[listIndex].tasks[taskIndex].attachments; i++) {
              if (vm.lists[listIndex].tasks[taskIndex].attachments[i]._id === attachment._id) {
                attachmentid = vm.lists[listIndex].tasks[taskIndex].attachments[i]._id;
              }
            }
          }

          if (attachmentid !== attachment._id) {
            return;
          }

          //send request to attachmentData.service, deleteAttachment function
          attachmentData.deleteAttachment(vm.boardID, listid, taskid, attachmentid)
            .then(() => {
              vm.lists[listIndex].tasks[taskIndex].attachments.splice(attachmentIndex, 1);
              vm.modalTask.attachments = vm.lists[listIndex].tasks[taskIndex].attachments;

              //send information to another users to the modal window and on the board
              socketioFactory.emit('modalTaskServer', {
                modalList: vm.modalList,
                modalListIndex: vm.modalListIndex,
                modalTask: vm.modalTask,
                modalTaskIndex: vm.modalTaskIndex
              });
              socketioFactory.emit('boardServer', { boardColor: vm.boardColor, lists: vm.lists });
            })
            .catch((err) => {
              if (err.status === 401) {
                messageFactory.message = 'Войдите в учётную запись для продолжения.';
                vm.logout();
              } else {
                vm.message = 'Не удалось удалить вложение.';
              }
            })
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else if (err.message === 'task not found') {
            deletedTask();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

    //get task information about task position and for modal window
    vm.taskEditor = (evt, ...taskData) => {

      let arrForCoords = evt.composedPath();
      for (let i = 0; i < arrForCoords.length; i++) {
        if (arrForCoords[i].nodeName.toLowerCase() === 'a' ) {
          arrForCoords.splice(0, i);
          break;
        }
      }
      let listContentY = arrForCoords[3].offsetTop,
        listContentX = arrForCoords[3].offsetLeft,
        taskY = arrForCoords[1].offsetTop,
        taskX = arrForCoords[1].offsetLeft,
        scrollY = arrForCoords[3].scrollTop,
        scrollX = arrForCoords[7].scrollLeft;

      vm.taskEditWidth = arrForCoords[1].clientWidth;
      vm.deviceWidth = arrForCoords[7].clientWidth;
      vm.deviceHeight = arrForCoords[7].clientHeight;

      vm.taskEditCoordX = listContentX + taskX - scrollX;
      vm.taskEditCoordY = listContentY + taskY - scrollY;
      if (vm.deviceHeight - vm.taskEditCoordY < 135) {
        vm.taskEditCoordY = vm.deviceHeight - 140;
      }
      vm.editTaskBtnSide = vm.taskEditCoordX + 565 > vm.deviceWidth;
      vm.editTaskBtnVerticalSide = vm.taskEditCoordY + 220 > vm.deviceHeight;
      vm.editTaskDatePickerVerticalSide = vm.taskEditCoordY + 300 > vm.deviceHeight;

      vm.editTaskBtnSide ? vm.editTaskMenuLeft = 'quick-task-edit-buttons-left' : vm.editTaskMenuLeft = '';
      vm.editTaskBtnSide ? vm.taskPositionMenu = 'task-position-menu-left' : vm.taskPositionMenu = '';
      vm.editTaskBtnVerticalSide ? vm.taskVerticalPositionMenu = 'task-position-menu-top' : vm.taskVerticalPositionMenu = '';
      vm.editTaskDatePickerVerticalSide ? vm.taskVerticalPositionDatePicker = 'quick-task-edit-date-picker-menu-top' : vm.taskVerticalPositionDatePicker = '';

      vm.modalList = taskData[0];
      vm.modalListIndex = taskData[1];
      vm.modalTask = taskData[2];
      vm.modalTaskIndex = taskData[3];
      vm.editedTaskName = vm.modalTask.taskName;
      vm.listNameForTask = vm.modalList.listName;

    };

    //get list information for positioning an item on the screen
    vm.listMenuPosition = (evt) => {

      let arrForCoords = evt.composedPath();
      for (let i = 0; i < arrForCoords.length; i++) {
        if (arrForCoords[i].nodeName.toLowerCase() === 'a' ) {
          arrForCoords.splice(0, i);
          break;
        }
      }
      let deviceWidth = arrForCoords[7].clientWidth,
        elementPosition = evt.x;
      (elementPosition + 350 > deviceWidth) && (elementPosition - 350 < 0) ? vm.listPositionMenu = 'list-menu-center' : (elementPosition + 350 > deviceWidth) ? vm.listPositionMenu = 'list-menu-left' : vm.listPositionMenu = '' ;

    };

    //function for due date, get current date and time
    vm.dateSetting = (listIndex, taskIndex, list, task) => {

      if (!list._id) {
        deletedList();
        return;
      }
      if (!task._id) {
        deletedTask();
        return;
      }

      checkTaskPosition(listIndex, taskIndex, list, task)
        .then((data) => {
          listIndex = data.listIndex;
          taskIndex = data.taskIndex;
          let date = vm.lists[listIndex].tasks[taskIndex].date;
          if (date) {
            vm.now = new Date(date);
          } else {
            vm.now = new Date();
            vm.now.setDate(vm.now.getDate()+1);
            vm.now.setHours(12, 0, 0, 0);
          }
          vm.taskDate = vm.now;
          vm.taskTime = vm.now;
        })
        .catch((err) => {
          if (err.message === 'list not found') {
            deletedList();
          } else if (err.message === 'task not found') {
            deletedTask();
          } else {
            vm.message = 'Произошла ошибка.';
          }
        });

    };

  }

})();