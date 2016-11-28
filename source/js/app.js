function ObjectKeys(o)
{
  var keys = [];
  for(var k in o)
    keys.push(k);
  return keys;
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

/* AngularJS Module */
angular.module('AngularApp', [
    'ngRoute',
    'ui.bootstrap',
    'door3.css',
    'LocalStorageModule',
    'googlechart',
    'isteven-multi-select'
])
.filter('titleCase', function() {
  return function(input) {
    input = input || '';
    return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  };
})
/* AngularJS Configuration */
.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html'
    })
    .when('/decks', {
      templateUrl: 'views/decks.html'
    })
    .when('/helper', {
      templateUrl: 'views/helper.html'
    })
    .otherwise({
      redirectTo: '/'
    });
})
/* Navigation Bar Controller */
.controller('NavbarController', ['$scope','$location', function($scope,$location){
    $scope.IsCollapsed = true;
    $scope.Toggle = function() {
        this.IsCollapsed = !this.IsCollapsed;
    };
    $scope.IsActive = function(path) {
        return path === $location.path();
    };
}])
/* Theme Changer Controller */
.controller('ThemeController', ['$scope','$css','localStorageService', function($scope,$css,localStorageService){
    $scope.Themes = {
      cerulean:  { Name: 'Cerulean'  , ID: 'cerulean'  },
      cosmo:     { Name: 'Cosmo'     , ID: 'cosmo'     },
      cyborg:    { Name: 'Cyborg'    , ID: 'cyborg'    },
      darkly:    { Name: 'Darkly'    , ID: 'darkly'    },
      flatly:    { Name: 'Flatly'    , ID: 'flatly'    },
      journal:   { Name: 'Journal'   , ID: 'journal'   },
      lumen:     { Name: 'Lumen'     , ID: 'lumen'     },
      paper:     { Name: 'Paper'     , ID: 'paper'     },
      readable:  { Name: 'Readable'  , ID: 'readable'  },
      sandstone: { Name: 'Sandstone' , ID: 'sandstone' },
      simplex:   { Name: 'Simplex'   , ID: 'simplex'   },
      slate:     { Name: 'Slate'     , ID: 'slate'     },
      spacelab:  { Name: 'Spacelab'  , ID: 'spacelab'  },
      superhero: { Name: 'Superhero' , ID: 'superhero' },
      united:    { Name: 'United'    , ID: 'united'    },
      yeti:      { Name: 'Yeti'      , ID: 'yeti'      },
      bootstrap: { Name: 'Bootstrap' , ID: 'bootstrap' }
    };
    $scope.ChangeTheme = function(theme) {
      if($scope.CurrentTheme.ID !== 'bootstrap') {
        $css.remove('//maxcdn.bootstrapcdn.com/bootswatch/3.3.4/' + $scope.CurrentTheme.ID + '/bootstrap.min.css');
      } else {
        $css.remove('bootstrap-3.3.4-dist/css/bootstrap.min.css');
      }
      $scope.CurrentTheme = $scope.Themes[theme];
      if($scope.CurrentTheme.ID !== 'bootstrap') {
        $css.add('//maxcdn.bootstrapcdn.com/bootswatch/3.3.4/' + $scope.CurrentTheme.ID + '/bootstrap.min.css');
      } else {
        $css.add('bootstrap-3.3.4-dist/css/bootstrap.min.css');
      }
      localStorageService.set('theme',$scope.CurrentTheme.ID);
    };
    var theme = localStorageService.get('theme');
    if(theme === null || theme == 'undefined') {
      theme = 'bootstrap';
    }
    $scope.CurrentTheme = $scope.Themes[theme];
    $scope.ChangeTheme($scope.CurrentTheme.ID);
}])
/* Main Application Controller */
.controller('AppController', ['$scope','localStorageService', function($scope,localStorageService){
    $scope.Application =
      {
          Name: 'Hearthstone Deck DB',
          ShowFilters: JSON.parse(localStorageService.get('ShowFilters')),
          FilterClasses: [],
          FilterArchetypes: [],
          FilterEvents: [],
          CurrentlySelectedDeckIndex: 0,
          FilterStartDate: new Date(2016,09,04),
          FilterEndDate: new Date(),
          DeckListShowing: []
      };
    $scope.DeckHelperData = {};
    $scope.DeckHelperCards = [];
    $scope.StartDatePicker = {};
    $scope.EndDatePicker = {};
    $scope.ArchetypeData = {};
    $scope.EventData = {};
    $scope.ClassColors =
      {
        'mage': '#697194',
        'priest': '#A9B4B4',
        'warlock': '#4D3850',
        'shaman': '#33365C',
        'warrior': '#702124',
        'druid': '#5D3B2B',
        'rogue': '#3F3737',
        'hunter': '#325F27',
        'paladin': '#AC7938'
      };
    $scope.DECKDB = JSON_DECK_DB;
    $scope.EVENTS = [];
    $scope.DECKARCHETYPES = [];
    $scope.FILTERDECKDB = [];
    // Class Chart
    $scope.ClassChartData =
      {
        CountShaman: {v: 0},
        CountMage: {v: 0},
        CountPriest: {v: 0},
        CountRogue: {v: 0},
        CountWarrior: {v: 0},
        CountDruid: {v: 0},
        CountPaladin: {v: 0},
        CountWarlock: {v: 0},
        CountHunter: {v: 0}
      };
    $scope.ChartByClass = {};
    $scope.ChartByClass.type = "PieChart";
    $scope.ChartByClass.data =
      {
        "cols":  [
            {id: "c", label: "Class", type: "string"},
            {id: "s", label: "Seen", type: "number"}
        ],
        "rows":  [
            {c: [ {v: "Shaman"} ,$scope.ClassChartData.CountShaman]},
            {c: [ {v: "Mage"} ,$scope.ClassChartData.CountMage]},
            {c: [ {v: "Priest"} ,$scope.ClassChartData.CountPriest]},
            {c: [ {v: "Rogue"} ,$scope.ClassChartData.CountRogue]},
            {c: [ {v: "Warrior"} ,$scope.ClassChartData.CountWarrior]},
            {c: [ {v: "Druid"} ,$scope.ClassChartData.CountDruid]},
            {c: [ {v: "Paladin"} ,$scope.ClassChartData.CountPaladin]},
            {c: [ {v: "Warlock"} ,$scope.ClassChartData.CountWarlock]},
            {c: [ {v: "Hunter"} ,$scope.ClassChartData.CountHunter]}
        ]
      };
    $scope.ChartByClass.options =
      {
        'title':'Filtered Decks by Class',
        'chartArea':{left:0,top:15,width:'90%',height:'75%'}
      };
    // Archetype Chart
    $scope.ChartByArchetype = {};
    $scope.ChartByArchetype.type = "PieChart";
    $scope.ChartByArchetype.data =
      {
        "cols":  [
            {id: "c", label: "Archetype", type: "string"},
            {id: "s", label: "Seen", type: "number"}
        ]
      };
    $scope.ChartByArchetype.options =
      {
        'title':'Filtered Decks by Archetype',
        'chartArea':{left:0,top:15,width:'90%',height:'75%'}
      };
    // Event Chart
    $scope.ChartByEvent = {};
    $scope.ChartByEvent.type = "PieChart";
    $scope.ChartByEvent.data =
      {
        "cols":  [
            {id: "c", label: "Event", type: "string"},
            {id: "s", label: "Seen", type: "number"}
        ]
      };
    $scope.ChartByEvent.options =
      {
        'title':'Filtered Decks by Event',
        'chartArea':{left:0,top:15,width:'90%',height:'75%'}
      };
    $scope.PopulateDeckArchetypes = function()
      {
        $scope.ArchetypeData = {};
        for(var i=0;i<$scope.FILTERDECKDB.length;i++)
        {
          var deck = $scope.FILTERDECKDB[i];
          if(!ObjectKeys($scope.ArchetypeData).includes(deck.ARCHETYPE))
          {
            $scope.ArchetypeData[deck.ARCHETYPE] = {};
            $scope.ArchetypeData[deck.ARCHETYPE].CLASS = deck.CLASS;
            $scope.ArchetypeData[deck.ARCHETYPE].FILTERCOUNT = 1;
          } else $scope.ArchetypeData[deck.ARCHETYPE].FILTERCOUNT++;
        }
        for(var j=0;j<$scope.DECKDB.length;j++)
          if(!ObjectKeys($scope.ArchetypeData).includes($scope.DECKDB[j].ARCHETYPE))
            {
              if($scope.Application.FilterClasses.includes($scope.DECKDB[j].CLASS.toLowerCase()))
              {
                $scope.ArchetypeData[$scope.DECKDB[j].ARCHETYPE] = {};
                $scope.ArchetypeData[$scope.DECKDB[j].ARCHETYPE].CLASS = $scope.DECKDB[j].CLASS;
                $scope.ArchetypeData[$scope.DECKDB[j].ARCHETYPE].FILTERCOUNT = 0;
              }
            }
        $scope.DECKARCHETYPES = ObjectKeys($scope.ArchetypeData);
        $scope.DECKARCHETYPES.sort(function(a,b)
        {
          return $scope.ArchetypeData[a].FILTERCOUNT < $scope.ArchetypeData[b].FILTERCOUNT ? 1
            : $scope.ArchetypeData[a].FILTERCOUNT > $scope.ArchetypeData[b].FILTERCOUNT ? -1
            : 0;
        });
      };
    $scope.PopulateEvents = function()
      {
        $scope.EventData = {};
        for(var i=0;i<$scope.FILTERDECKDB.length;i++)
        {
          var deck = $scope.FILTERDECKDB[i];
          if(!ObjectKeys($scope.EventData).includes(deck.EVENT))
          {
            $scope.EventData[deck.EVENT] = {};
            $scope.EventData[deck.EVENT].FILTERCOUNT = 1;
          } else $scope.EventData[deck.EVENT].FILTERCOUNT++;
        }
        for(var j=0;j<$scope.DECKDB.length;j++)
          if(!ObjectKeys($scope.EventData).includes($scope.DECKDB[j].EVENT))
            {
                $scope.EventData[$scope.DECKDB[j].EVENT] = {};
                $scope.EventData[$scope.DECKDB[j].EVENT].FILTERCOUNT = 0;
            }
        $scope.EVENTS = ObjectKeys($scope.EventData);
        $scope.EVENTS.sort(function(a,b)
        {
          return $scope.EventData[a].FILTERCOUNT < $scope.EventData[b].FILTERCOUNT ? 1
            : $scope.EventData[a].FILTERCOUNT > $scope.EventData[b].FILTERCOUNT ? -1
            : 0;
        });
      };
    $scope.UpdateCharts = function()
      {
        $scope.ClassChartData.CountShaman.v = 0;
        $scope.ClassChartData.CountMage.v = 0;
        $scope.ClassChartData.CountPriest.v = 0;
        $scope.ClassChartData.CountRogue.v = 0;
        $scope.ClassChartData.CountWarrior.v = 0;
        $scope.ClassChartData.CountDruid.v = 0;
        $scope.ClassChartData.CountPaladin.v = 0;
        $scope.ClassChartData.CountWarlock.v = 0;
        $scope.ClassChartData.CountHunter.v = 0;
        for(var i=0;i<$scope.FILTERDECKDB.length;i++)
        {
          var deck = $scope.FILTERDECKDB[i];
          switch(deck.CLASS.toLowerCase())
          {
            case "shaman":
              $scope.ClassChartData.CountShaman.v++;
              break;
            case "rogue":
              $scope.ClassChartData.CountRogue.v++;
              break;
            case "mage":
              $scope.ClassChartData.CountMage.v++;
              break;
            case "priest":
              $scope.ClassChartData.CountPriest.v++;
              break;
            case "warlock":
              $scope.ClassChartData.CountWarlock.v++;
              break;
            case "warrior":
              $scope.ClassChartData.CountWarrior.v++;
              break;
            case "hunter":
              $scope.ClassChartData.CountHunter.v++;
              break;
            case "druid":
              $scope.ClassChartData.CountDruid.v++;
              break;
            case "paladin":
              $scope.ClassChartData.CountPaladin.v++;
              break;
          }
        }
        $scope.ChartByClass.data.rows.sort(function(a,b){
          return b.c[1].v < a.c[1].v ? -1
            : b.c[1].v > a.c[1].v ? 1
            : 0;
        });
        $scope.ChartByClass.options.slices =
        {
          0: { color: $scope.ClassColors[$scope.ChartByClass.data.rows[0].c[0].v.toLowerCase()] },
          1: { color: $scope.ClassColors[$scope.ChartByClass.data.rows[1].c[0].v.toLowerCase()] },
          2: { color: $scope.ClassColors[$scope.ChartByClass.data.rows[2].c[0].v.toLowerCase()] },
          3: { color: $scope.ClassColors[$scope.ChartByClass.data.rows[3].c[0].v.toLowerCase()] },
          4: { color: $scope.ClassColors[$scope.ChartByClass.data.rows[4].c[0].v.toLowerCase()] },
          5: { color: $scope.ClassColors[$scope.ChartByClass.data.rows[5].c[0].v.toLowerCase()] },
          6: { color: $scope.ClassColors[$scope.ChartByClass.data.rows[6].c[0].v.toLowerCase()] },
          7: { color: $scope.ClassColors[$scope.ChartByClass.data.rows[7].c[0].v.toLowerCase()] },
          8: { color: $scope.ClassColors[$scope.ChartByClass.data.rows[8].c[0].v.toLowerCase()] }
        };
        $scope.ChartByArchetype.data.rows = [];
        var r;
        for(var j=0;j<$scope.DECKARCHETYPES.length;j++)
        {
          var archetype = $scope.DECKARCHETYPES[j];
          r = {c: [{v: toTitleCase(archetype)},{v: $scope.ArchetypeData[archetype].FILTERCOUNT}]};
          $scope.ChartByArchetype.data.rows.push(r);
        }
        $scope.ChartByEvent.data.rows = [];
        for(var k=0;k<$scope.EVENTS.length;k++)
        {
          var evt = $scope.EVENTS[k];
          r = {c: [{v: toTitleCase(evt)},{v: $scope.EventData[evt].FILTERCOUNT}]};
          $scope.ChartByEvent.data.rows.push(r);
        }
      };
    $scope.FilterDecks = function()
      {
        $scope.DeckHelperData = {};
        $scope.DeckHelperCards = [];
        $scope.FILTERDECKDB = [];
        $scope.Application.DeckListShowing = [];
        for(var i=0;i<$scope.DECKDB.length;i++)
        {
          var deck = $scope.DECKDB[i];
          var dt = new Date(deck.DATE);
          if($scope.Application.FilterClasses.length === 0 || $scope.Application.FilterClasses.includes(deck.CLASS.toLowerCase()))
            if($scope.Application.FilterArchetypes.length === 0 || $scope.Application.FilterArchetypes.includes(deck.ARCHETYPE))
              if($scope.Application.FilterEvents.length === 0 || $scope.Application.FilterEvents.includes(deck.EVENT))
                if(dt >= $scope.Application.FilterStartDate)
                  if(dt <= $scope.Application.FilterEndDate)
                    {
                      $scope.FILTERDECKDB.push(deck);
                      for(var j=0;j<deck.CARDLIST.length;j++)
                      {
                        var card = deck.CARDLIST[j];
                        var cardName = card[1];
                        var cardCount = card[0];
                        if(!$scope.DeckHelperCards.includes(cardName))
                        {
                          $scope.DeckHelperCards.push(cardName);
                          $scope.DeckHelperData[cardName] = {};
                          $scope.DeckHelperData[cardName].SEENCOUNT = 1;
                          $scope.DeckHelperData[cardName].TOTALCOUNT = cardCount;
                        }
                        else
                        {
                          $scope.DeckHelperData[cardName].SEENCOUNT++;
                          $scope.DeckHelperData[cardName].TOTALCOUNT = $scope.DeckHelperData[cardName].TOTALCOUNT + cardCount;
                        }
                      }
                    }
        }
        $scope.DeckHelperCards.sort(function(a,b){
          return  $scope.DeckHelperData[a].SEENCOUNT < $scope.DeckHelperData[b].SEENCOUNT ? 1
            : $scope.DeckHelperData[a].SEENCOUNT > $scope.DeckHelperData[b].SEENCOUNT ? -1
            : 0;
        });
        $scope.FILTERDECKDB.sort(function(a,b){
          return a.DATE < b.DATE ? 1
            : a.DATE > b.DATE ? -1
            : 0;
        });
        $scope.PopulateDeckArchetypes();
        $scope.PopulateEvents();
        $scope.UpdateCharts();
        $scope.Application.CurrentlySelectedDeckIndex = 0;
        $scope.SelectDeck($scope.Application.CurrentlySelectedDeckIndex);
        //alert($scope.Application.FilterArchetypes);
      };
    $scope.ToggleFilters = function()
      {
        $scope.Application.ShowFilters = !$scope.Application.ShowFilters;
        localStorageService.set('ShowFilters',$scope.Application.ShowFilters);
      };
    $scope.SelectDeck = function(index)
      {
        $scope.Application.CurrentlySelectedDeck = $scope.FILTERDECKDB[index];
      };
    $scope.GetCardTooltip = function(cardlist)
      {
        var html = "";
        for (var i=0;i<cardlist.length;i++)
        {
          var c = cardlist[i];
          html = html + c[0] + "x " + c[1] + "<br />";
        }
        return html;
      };
    $scope.OpenStartDatePicker = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.StartDatePicker.opened = true;
    };
    $scope.OpenEndDatePicker = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.EndDatePicker.opened = true;
    };
    $scope.ResetFilters = function()
    {
      var today = new Date();
      var monthago = new Date();
      monthago.setMonth(monthago.getMonth() - 1);
      $scope.Application.FilterClasses = [];
      $scope.Application.FilterEvents = [];
      $scope.Application.FilterArchetypes = [];
      $scope.Application.FilterStartDate = new Date(2016,09,04);
      $scope.Application.FilterEndDate = new Date();
      $scope.FilterDecks();
    };
    $scope.ResetFilters();
}]);