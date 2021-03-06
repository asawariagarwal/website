function makeAccordion(elementSelector) {
    $(elementSelector).accordion({
        active: false,
        collapsible: true,
        heightStyle: 'content'
    });
}

function getContentUsingAjax(section, elementSelector) {
    $.ajax({
        type: 'GET',
        url: section + '.html',
        error: function() {

        },
        success: function(data) {
            $(elementSelector).addClass('embedded');
            $(elementSelector).html('<div><button onclick="$(\'' + elementSelector + '\').html(\'\');' +
                                                         ' $(\'' + elementSelector + '\').removeClass(\'embedded\');" ' +
                                                 'class="btn-dismiss">Dismiss</button></div>' + data);
            $(elementSelector + ' > div > .btn-dismiss').button();
        }
    });
}

function addCollapseAndExpandButtonsForComponents(accordionHeaderSelector, divId) {
    $(accordionHeaderSelector).append('<button id="collapse-' + divId + '" class="btn-collapse">-</button>' +
                                      '<button id="expand-' + divId + '" class="btn-expand">+</button>');
    $(accordionHeaderSelector + ' > .btn-collapse').on('click', function(e) {
        e.stopPropagation();
        var divId = $(this).attr('id').substr(('collapse-').length);
        var expandedAccordions = $('.' + divId + ' > .ui-accordion-header-active');
        $(expandedAccordions).click();
        $(this).hide();
        $(accordionHeaderSelector + ' > .btn-expand').show();
        if ($(accordionHeaderSelector).hasClass('ui-accordion-header-active')) {
            $(accordionHeaderSelector).click();
        }
    });
    $(accordionHeaderSelector + ' > .btn-collapse').button();
    $(accordionHeaderSelector + ' > .btn-collapse').hide();
    $(accordionHeaderSelector + ' > .btn-expand').on('click', function(e) {
        e.stopPropagation();
        var divId = $(this).attr('id').substr(('expand-').length);
        var collapseInnerAccordionsButtons = $('.' + divId + ' h3 > .btn-collapse');
        $(collapseInnerAccordionsButtons).click();
        var collapsedAccordions = $('.' + divId + ' > h3:not(.ui-accordion-header-active)');
        $(collapsedAccordions).click();
        $(this).hide();
        $(accordionHeaderSelector + ' > .btn-collapse').show();
        if (!$(accordionHeaderSelector).hasClass('ui-accordion-header-active')) {
            $(accordionHeaderSelector).click();
        }
    });
    $(accordionHeaderSelector + ' > .btn-expand').button();
}

function addCollapseAndExpandButtonsForWeek(accordionHeaderSelector, divId) {
    addCollapseAndExpandButtonsForComponents(accordionHeaderSelector, divId);
    $(accordionHeaderSelector + ' > .btn-expand').show();
    $(accordionHeaderSelector + ' > .btn-collapse').hide();
    $(accordionHeaderSelector).append('<button id="collapseall-' + divId + '" class="btn-collapseall">--</button>' +
                                      '<button id="expandall-' + divId + '" class="btn-expandall">++</button>');
    $(accordionHeaderSelector + ' > .btn-collapseall').on('click', function(e) {
        e.stopPropagation();
        var divId = $(this).attr('id').substr(('collapseall-').length);
        var collapseAccordionButton = $(accordionHeaderSelector + ' > .btn-collapse');
        var collapseSubAccordionButtons = $('.' + divId + ' > .ui-accordion-header .btn-collapse');
        $(collapseAccordionButton).click();
        $(collapseSubAccordionButtons).click();
        $(this).hide();
        $(accordionHeaderSelector + ' > .btn-expandall').show();
    });
    $(accordionHeaderSelector + ' > .btn-collapseall').button();
    $(accordionHeaderSelector + ' > .btn-collapseall').hide();
    $(accordionHeaderSelector + ' > .btn-expandall').on('click', function(e) {
        e.stopPropagation();
        var divId = $(this).attr('id').substr(('expandall-').length);
        var collapsedAccordions = $(accordionHeaderSelector + ' > .btn-expand');
        var expandSubAccordionButtons = $('.' + divId + ' > .ui-accordion-header .btn-expand');
        $(collapsedAccordions).click();
        $(expandSubAccordionButtons).click();
        $(this).hide();
        $(accordionHeaderSelector + ' > .btn-collapseall').show();
    });
    $(accordionHeaderSelector + ' > .btn-expandall').button();
}

function checkIfAllComponentsChecked() {
    var isAllChecked = true;
    $('.preferences').each(function() {
        var type = $(this).prop('value');
        if (!$(this).prop('checked') && type != 'all') {
            isAllChecked = false;
        }
    });
    return isAllChecked;
}

$(document).ready(function() {

    makeAccordion('.weeklyschedule');
    $('.weeklyschedule > h3').each(function() {
        var id = $(this).attr('id');
        var week = id.substr(('header-content-week').length);
        addCollapseAndExpandButtonsForWeek('#' + id, 'content-week' + week);
    });
    var bannerHeight = 25;
    var headerHeight = 40;
    var topMargin = 5;
    var topPadding = 5;
    $('#form-preferences').css('height', headerHeight);
    $('#form-preferences').css('padding-top', topPadding);
    $('#content').css('margin-top', topMargin);

    function calculateContainerSize() {
        return $(window).height() - headerHeight - bannerHeight - topMargin - topPadding;
    }

    $('#content').css('height', calculateContainerSize());

    $(window).resize(function() {
        $('#content').css('height', calculateContainerSize());
    });

    for (var week = 0; week <= 13; week++) {
        $('#content-week' + week).html('<img height="75" width="75" class="margin-center-horizontal" src="images/ajax-preload.gif"/>');
        $.ajax({
            type: 'GET',
            async: false,
            url: 'week' + week + '.html',
            error: function() {

            },
            success: function(data) {
                var components = ['things-to-do', 'homework', 'tutorial', 'lecture', 'deadline1', 'deadline2', 'ilo'];
                $('#content-week' + week).html(data);
                makeAccordion('.content-week' + week);
                for (var i in components) {
                    var component = components[i];
                    makeAccordion('.' + component + '-week' + week);
                }
                for (var i in components) {
                    var component = components[i];
                    addCollapseAndExpandButtonsForComponents('#' + component + '-content-week' + week, component + '-week' + week);
                }
                for (var i in components) {
                    var component = components[i];
                }
                $('.preferences').each(function() {
                    var type = $(this).prop('value');
                    if (!$(this).prop('checked')) {
                        $('.' + type + '.content-week' + week).hide();
                    }
                });
            }
        });
    }

    // toggles showing/hiding certain sections according to the preferences checkbox

    $(document).on('change', '.preferences', function() {
        var type = $(this).prop('value');
        if (type === 'all') {
            var components = ['things-to-do', 'homework', 'tutorial', 'lecture', 'deadline', 'ilo'];
            if ($(this).prop('checked')) {
                for (var i in components) {
                    var component = components[i];
                    var isChecked = $('.preferences[value="' + component + '"]').prop('checked');
                    if (!isChecked) {
                        $('.preferences[value="' + component + '"]').click();
                    }
                }
            } else {
                for (var i in components) {
                    var component = components[i];
                    var isChecked = $('.preferences[value="' + component + '"]').prop('checked');
                    if (isChecked) {
                        $('.preferences[value="' + component + '"]').click();
                    }
                }
            }
        } else {
            if ($(this).prop('checked')) {
                $('.' + type).show();
                if (checkIfAllComponentsChecked()) {
                    $('.preferences[value="all"]').prop('checked', true);
                }
            } else {
                $('.' + type).hide();
                if ($('.preferences[value="all"]').prop('checked')) {
                    $('.preferences[value="all"]').prop('checked', false);
                }
            }
        }
    });

});