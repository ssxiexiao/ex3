angular.module('exCtrl',[])
	.controller('statusCtrl', function($scope, $sce, RecordService, htmlContent){
		$scope.statusId = 1;
		$scope.statusNumber = 6;
		$scope.LANG = 'CN';
		$scope.id = undefined;
		$scope.data = {};
		$scope.data.id = undefined;
		$scope.trustHtml = function(html){
			var newHtml = undefined;
			if(typeof(html) === 'object'){
				newHtml = {};
				for(var i in html){
					// console.log(i);
					newHtml[i] = $scope.trustHtml(html[i]);
				}
			}
			else{
				newHtml = $sce.trustAsHtml(html);
			}
			return newHtml;
		}
		$scope.htmlContent = $scope.trustHtml(htmlContent);
		// console.log($scope.htmlContent);
		$scope.statusNext = function(){
			console.log($scope.data.id);
			if(!$scope.data.id){
				alert('pls input id');
				return;
			}
			if($scope.statusId === 1){
				RecordService.getDataFromServer($scope.data.id);
			}
			$scope.statusId += 1;
		};
		$scope.$watch(function(){ return RecordService.getUploadStatus();}, function(newValue){
			if(newValue === true){
				$scope.statusId = $scope.statusNumber;
			}
		});
		$scope.$watch(function(){ return RecordService.getId();}, function(newValue){
			$scope.id = newValue;
		});
	})
	.controller('trainingCtrl', function($scope){
		$scope.train = {
			'answer': undefined,
			'counter': 0,
			'indice': 1,
			'number': 5,
			'dataVisible': 0,
			'data': 0
		};
		$scope.next = function() {
			$scope.train.counter += 1;
			if($scope.train.counter === 1){
				$scope.train.dataVisible = 1;
				return;
			}
			if($scope.train.counter === 2){
				$scope.train.counter = 0;
				$scope.train.indice += 1;
				$scope.train.answer = null;
				$scope.train.dataVisible = 0;
				return;
			}
		};
		$scope.complete = function() {
			$scope.train.counter += 1;
			if($scope.train.counter === 1){
				$scope.train.dataVisible = 1;
				return;
			}
			if($scope.train.counter === 2){
				$scope.train.counter = 0;
				$scope.train.answer = null;
				$scope.train.dataVisible = 0;
				$scope.statusNext();
				return;
			}
		};
		$scope.getData = function() {
			var angle = 1+parseInt(Math.random() * 49);
			var state = [
				[0.735, 0],
				[0.735, 1],
				[0.735, 2],
				[0.735, 3],
				[0.735, 4],
			];
			// console.log(data);
			$scope.train.data = angle;
			var tmp = state[$scope.train.indice-1].slice(0);
			tmp.splice(1,0,angle);
			console.log(tmp);
			var data = {
				'scale': tmp[0],
				'angle': tmp[1] / 100,
				'scaleSize': tmp[2]
			}
			return data;
		};
		$scope.keydown = function($event) {
			if($event.keyCode === 13){
				if($scope.statusId === 2){
					if($scope.train.indice < $scope.train.number) $scope.next();
					else $scope.complete();
				}
			}
			return;
		}
	})
	.controller('userStudyCtrl', function($scope, RecordService){
		$scope.userStudy = {
			'indice': 0,
			'maxBackward': 1,
			'number': 0,
			'answer': undefined,
			'data': undefined,
			'partNumer': 3,
			'partSize': 20,
			'partBegin': true,
			'partIndice': 1,
			'startTime': undefined,
			'endTime': undefined,
			'error':{
				'CN':['','输入不能为空', '必须是0到100的整数'],
				'EN':['',"input cannot be empty", 'must be an integer between 0 and 100']
			},
			'errorStatus': 0
		};
		$scope.$watch('userStudy.answer', function(newValue) {
			var reg = new RegExp('^\\d+$');
			if (newValue === undefined){
				$scope.userStudy.errorStatus = 1;
			}
			else if (!reg.test(newValue) || newValue > 100 || newValue < 0){
				$scope.userStudy.errorStatus = 2;
			}
			else{
				$scope.userStudy.errorStatus = 0;
			}
		});
		$scope.prev = function() {
			$scope.userStudy.endTime = new Date();
			RecordService.saveAnswer($scope.userStudy.answer, -3, $scope.userStudy.endTime, $scope.userStudy.indice - 1);
			$scope.userStudy.indice = $scope.userStudy.indice <= 1 || RecordService.latest() - $scope.userStudy.indice >= $scope.userStudy.maxBackward ? $scope.userStudy.indice : $scope.userStudy.indice - 1;
			$scope.userStudy.answer = RecordService.getAnswerByIndice($scope.userStudy.indice - 1);
			$scope.userStudy.startTime = new Date();
			RecordService.saveAnswer($scope.userStudy.answer, -1, $scope.userStudy.startTime, $scope.userStudy.indice - 1);
			return;
		};
		$scope.next = function() {
			$scope.userStudy.endTime = new Date();
			if ($scope.userStudy.errorStatus != 0) {
				return;
			}
			RecordService.saveAnswer($scope.userStudy.answer, -2, $scope.userStudy.endTime, $scope.userStudy.indice - 1);
			$scope.userStudy.indice += 1;
			$scope.userStudy.answer = RecordService.getAnswerByIndice($scope.userStudy.indice - 1);
			RecordService.updateLatest($scope.userStudy.indice);
			$scope.partInfoUpdate();
			$scope.userStudy.startTime = new Date();
			RecordService.saveAnswer($scope.userStudy.answer, -1, $scope.userStudy.startTime, $scope.userStudy.indice - 1);
			return;
		};
		$scope.complete = function() {
			$scope.userStudy.endTime = new Date();
			if ($scope.userStudy.errorStatus != 0) {
				return;
			}
			RecordService.saveAnswer($scope.userStudy.answer, -2, $scope.userStudy.endTime, $scope.userStudy.indice - 1);
			$scope.statusNext();
			return;
		};
		$scope.getData = function() {
			var data = RecordService.getDataByIndice($scope.userStudy.indice - 1);
			$scope.userStudy.data = {
				'scale': data[0],
				'angle': data[1] / 100,
				'scaleSize': data[2],
			};
			return $scope.userStudy.data;
		};
		$scope.partInfoUpdate = function(){
			$scope.userStudy.partBegin = ($scope.userStudy.indice % $scope.userStudy.partSize) === 1 ? true : false;
			$scope.userStudy.partIndice = Math.floor(($scope.userStudy.indice - 1) / $scope.userStudy.partSize) + 1;
		};
		$scope.partStart = function(){
			if($scope.userStudy.partIndice === 1){
				$scope.userStudy.indice = 1;
				$scope.userStudy.number = RecordService.getDataNumber();
				$scope.userStudy.partSize = Math.floor($scope.userStudy.number / $scope.userStudy.partNumer);
			}
			$scope.userStudy.partBegin = false;
			$scope.userStudy.answer = RecordService.getAnswerByIndice($scope.userStudy.indice - 1);
			$scope.userStudy.startTime = new Date();
			RecordService.saveAnswer($scope.userStudy.answer, -1, $scope.userStudy.startTime, $scope.userStudy.indice - 1);
		};
		$scope.keydown = function($event) {
			RecordService.saveAnswer($scope.userStudy.answer, event.keyCode, new Date(), $scope.userStudy.indice - 1);
			if($event.keyCode === 13){
				if($scope.statusId === 4 && !$scope.userStudy.partBegin){
					if($scope.userStudy.indice < $scope.userStudy.number) $scope.next();
					else $scope.complete();
				}
			}
			return;
		}
	})
	.controller('infoCtrl', function($scope, RecordService){
		$scope.info = {
			'personInfo': {},
			'choices': [],
			'feedback': '',
			'experience':undefined,
			'experienceYears':{
				'CN':['一年以下','一年','两年','三年或以上'],
				'EN':['less than a year', 'one year', 'two years', 'three years or more']
			},
			'skillLevel': undefined,
			'skillLevels': {
				'CN':['非常不熟练', '不熟练', '一般', '熟练', '非常熟练'],
				'EN':['very bad', 'bad', 'normal', 'well', 'very well']
			},
			'favourite': [],
			'accurate': [],
			'question': {
				'CN':[
					'在以下条件中您最喜欢根据哪种进行估计？(多选)',
					'在以下条件中您觉得根据哪种进行估计最准确？(多选)'
				],
				'EN':[
					'When you were making estimations, which of the belowing conditions did you prefer?(Multi-choice)',
					'When you were making estimations, in which condition do you think were the most accurate?(Multi-choice)'
				]
			}
		};
		var angle = 0.4;
		var state = [
			[0.735, 0, 0],
			[0.735, 1, 0],
			[0.735, 2, 0],
			[0.735, 3, 0],
			[0.735, 4, 0],
		];
		// for(var i = 0; i < 4; i++){
		// 	$scope.info.choices.push([]);
		// 	var indice = $scope.info.choices.length - 1;
		// 	for(var j = 0; j < 3; j++){
		// 		$scope.info.choices[indice].push([scale[j], angle, Math.floor(i/2), 0, 0]);
		// 		if(j > 0){
		// 			$scope.info.choices[indice].push([scale[j], angle, Math.floor(i/2), 1, 0]);
		// 		}
		// 	}
		// }
		for(var i = 0; i < 2; i++){
			$scope.info.choices.push([]);
			var indice = $scope.info.choices.length - 1;
			for(var j = 0; j < state.length; j++){
				var tmp = state[j].slice(0);
				tmp.splice(1,0,angle);
				$scope.info.choices[indice].push(tmp);
			}
		}
		console.log($scope.info.choices);
		$scope.submit = function(){
			$scope.info.favourite = [];
			$scope.info.accurate = [];
			for(var i = 0; i < $scope.info.choices.length; i+=2){
				// $scope.info.favourite.push([]);
				// var indice = $scope.info.favourite.length - 1;
				for(var j = 0; j < $scope.info.choices[i].length; j++){
					$scope.info.favourite.push($scope.info.choices[i][j][$scope.info.choices[i][j].length-1]);
				}
			}
			for(var i = 1; i < $scope.info.choices.length; i+=2){
				// $scope.info.accurate.push([]);
				// var indice = $scope.info.accurate.length - 1;
				for(var j = 0; j < $scope.info.choices[i].length; j++){
					$scope.info.accurate.push($scope.info.choices[i][j][$scope.info.choices[i][j].length-1]);
				}
			}
			RecordService.updateInfo($scope.info);
			RecordService.postData();
		};
	});

