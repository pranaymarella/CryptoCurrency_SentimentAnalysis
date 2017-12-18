$(document).ready(function() {
    $('#fullpage').fullpage({
        scrollBar: false,
        responsiveWidth: 10000,
        navigation: false,
        anchors:['home', 'education', 'skills', 'projects', 'contact'],
        fitToSection: true
    });

    $.fn.digits = function(){
        return this.each(function(){
            $(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") );
        });
    }

    $getCryptoData = function(crypto) {
        // If a parameter is not passed in, default to bitcoin
        console.log(crypto);
        if (!crypto) {
            crypto = 'bitcoin';
        }

        $.trim(crypto);

        // API of Coinmarketcap
        console.log(crypto);
        var url = "https://api.coinmarketcap.com/v1/ticker/" + crypto + '/';
        console.log(url);
        $.ajax({
            url: url,
            dataType: 'json',
        }).done(function(data) {
            // Set the html values by looking through the returned data object
            $('.currency_name').html(data[0].name + ' ');
            $('.currency_ticker').html(data[0].symbol);
            $('.price').html('$' + data[0].price_usd + '  ');
            $('.currency_return_percent').html('(' + data[0].percent_change_24h + '%)');
            $('.amount_available').html(parseInt(data[0].available_supply));
            $('.marketcap').html('$ ' + data[0].market_cap_usd);
            $('.amount_max').html(parseInt(data[0].max_supply));
            $('.rank').html(parseInt(data[0].rank));

            // adding commas to numbers
            $('.price').digits();
            $('.amount_available').digits();
            $('.marketcap').digits();
            $('.amount_max').digits();


            $ticker = data[0].symbol;
            $url = 'https://api.cryptonator.com/api/full/' + $ticker + '-usd';

            $.ajax({
                url: $url,
                dataType: 'json',
            }).done(function(data) {
                var temp;
                console.log(data);

                $('.exchanges_table tr').not(function(){ return !!$(this).has('th').length; }).remove();
                for (var i = 0; i < data.ticker.markets.length && i < 7; i++) {
                    $temp = data.ticker.markets[i];

                    if ($temp['volume'] > 0) {
                        $('.exchanges_table_body').append('<tr><td>' + $temp['market'] +'</td><td>$' + parseFloat($temp['price']).toFixed(2) + '</td><td>' + parseFloat($temp['volume']).toFixed(2) + '</td></tr>');
                    }
                }
            });

            // TWITTER AJAX CALL
            var twitter_url = '/twitter/$ticker';

            $.ajax({
                url: twitter_url.replace('ticker', $ticker.toLowerCase()),
                dataType: 'json',
            }).done(function(data) {
                var chart = new Chartist.Pie('.twitter-chart', {
                  series: [data.total_negative*-1, data.total_positive, data.total_neutral],
                  labels: [1, 2]
                }, {
                  donut: true,
                  showLabel: false
                });

                chart.on('draw', function(data) {
                  if(data.type === 'slice') {
                    // Get the total path length in order to use for dash array animation
                    var pathLength = data.element._node.getTotalLength();

                    // Set a dasharray that matches the path length as prerequisite to animate dashoffset
                    data.element.attr({
                      'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
                    });

                    // Create animation definition while also assigning an ID to the animation for later sync usage
                    var animationDefinition = {
                      'stroke-dashoffset': {
                        id: 'anim' + data.index,
                        dur: 1000,
                        from: -pathLength + 'px',
                        to:  '0px',
                        easing: Chartist.Svg.Easing.easeOutQuint,
                        // We need to use `fill: 'freeze'` otherwise our animation will fall back to initial (not visible)
                        fill: 'freeze'
                      }
                    };

                    // If this was not the first slice, we need to time the animation so that it uses the end sync event of the previous animation
                    if(data.index !== 0) {
                      animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
                    }

                    // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
                    data.element.attr({
                      'stroke-dashoffset': -pathLength + 'px'
                    });

                    // We can't use guided mode as the animations need to rely on setting begin manually
                    // See http://gionkunz.github.io/chartist-js/api-documentation.html#chartistsvg-function-animate
                    data.element.animate(animationDefinition, false);
                  }
                });

                var score = data.total_positive + (data.total_negative * -1) + data.total_neutral;
                $(".twitter_positive").text(Math.ceil((data.total_positive / score)*100) + '%');
                $(".twitter_negative").text(Math.ceil((data.total_negative*-1 / score)*100) + '%');
                $(".twitter_neutral").text(Math.ceil((data.total_neutral / score)*100) + '%');
            });


            // GOOGLE TRENDS AJAX CALL
            var url = '/google/name';
            var gtrends_query_name = data[0].name + ' cryptocurrency';
            $.ajax({
                url: url.replace('name', gtrends_query_name.toLowerCase()),
                dataType: 'json'
            }).done(function(data) {
                console.log(data.default.timelineData);
                var chart_data = [];
                for (var i = 0; i < data.default.timelineData.length; i++) {
                    chart_data.push({x: new Date(data.default.timelineData[i].formattedAxisTime), y: data.default.timelineData[i].value[0]});
                }

                console.log(chart_data);

                var chart = new Chartist.Line('.gtrends-chart', {
                  series: [
                    {
                      name: 'series-1',
                      data: chart_data,
                    }
                  ]
                }, {
                    showPoint: false,
                    fullWidth: true,
                    low: 0,
                    showArea: true,
                    axisX: {
                        type: Chartist.FixedScaleAxis,
                        divisor: 12,
                        labelInterpolationFnc: function(value) {
                            return moment(value).format('MMM D Y');
                        }
                    }
                });

                chart.on('draw', function(data) {
                    if (data.type === 'line' || data.type === 'area') {
                        data.element.animate({
                            d: {
                                begin: 2000 * data.index,
                                dur: 2000,
                                from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                                to: data.path.clone().stringify(),
                                easing: Chartist.Svg.Easing.easeOutQuint
                            }
                        });
                    }
                });
            });
        });
    }

    $getCryptoData('bitcoin');

    $('.refresh').on('click', function() {
        var currency = $('.currency_name').html().toLowerCase();
        $getCryptoData(currency);
    });

    $('.search_button').on('click', function() {
        var new_crypto = $('#search').val().split(' ').slice(0, -1);
        var q = '';

        for (var i = 0; i < new_crypto.length; i++) {
            if (i != 0) {
                q = q + ' ' + new_crypto[i];
            } else {
                q = q + new_crypto[i];
            }
        }

        $getCryptoData(q);
    });

    // Typeahead JS
    var substringMatcher = function(strs) {
      return function findMatches(q, cb) {
        var matches, substrRegex;

        // an array that will be populated with substring matches
        matches = [];

        // regex used to determine if a string contains the substring `q`
        substrRegex = new RegExp(q, 'i');

        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(strs, function(i, str) {
          if (substrRegex.test(str)) {
            // the typeahead jQuery plugin expects suggestions to a
            // JavaScript object, refer to typeahead docs for more info
            matches.push({ value: str });
          }
        });

        cb(matches);
      };
    };

    $.ajax({
        url: 'https://api.coinmarketcap.com/v1/ticker/',
        dataType: 'json',
    }).done(function(data) {
        console.log(data);
        var currencies = [];

        for (var i = 0; i < data.length; i++) {
            currencies.push('' + data[i].name + ' (' +  data[i].symbol + ')');
        }

        $('#scrollable-dropdown-menu .typeahead').typeahead({
            hint: true,
            minLength: 1,
            resultContainer: false,
        },
        {
            name: 'currencies',
            displayKey: 'value',
            source: substringMatcher(currencies),
            templates: {
                empty: [
                    '<div class="empty-message">',
                    'Unable to find this cryptocurrency in our database',
                    '</div>'
                ].join('\n'),
                suggestion: function(data) {
                    return '<p><strong>' + data.value + '</strong>';
                }
            }
        });
    });
});
