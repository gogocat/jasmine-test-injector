(function () {
    //============== MessagePreferences.aspx ==============

    // returns an array containing all checkboxes with an id containing IdSubstring
    function getCheckboxesByIdContaining(IdSubstring) {
        return $("input:checkbox").filter("[id*='" + IdSubstring + "']").get();
    }

    function setCheckBoxState(checkBox, checkBoxState) {
        if (checkBox && checkBox.checked !== checkBoxState) {
            if (checkBox.disabled) {
                checkBox.disabled = false;
                checkBox.checked = !checkBox.checked;
                checkBox.disabled = true;
            } else {
                checkBox.click();
            }
        }
    }

    /* parent checkbox can enable or disable all children checkboxes at once.
    make sure all child checkboxes contain childCheckBoxIdSubstring within the id */
    function selectAll(parentCheckBoxIdSubstring, childCheckBoxIdSubstring) {

        var parent = getCheckboxesByIdContaining(parentCheckBoxIdSubstring)[0];
        if (!parent) return;
        var children = getCheckboxesByIdContaining(childCheckBoxIdSubstring);
        if (children.length === 0) return;

        $(parent).click(function () {
            var selected = this.checked;
            for (var i = 0; i < children.length; i++) {
                setCheckBoxState(children[i], selected);
            }
            this.checked = selected; // ensures no side-effect from calling children.click()
        });

        $(children).click(function () {
            var childClone = []; // ensures no side-effect from calling parent.click()
            for (var j = 0; j < children.length; j++) {
                childClone[j] = {};
                childClone[j].checked = children[j].checked;
            }
            for (var j = 0; j < children.length; j++) {
                if (!children[j].checked) {
                    setCheckBoxState(parent, false);
                    for (var k = 0; k < children.length; k++) {
                        setCheckBoxState(children[k], childClone[k].checked);
                    }
                    return;
                }
            }
            setCheckBoxState(parent, true);
        });
    }

    function CloseConfirmDialog() {


        parent.window.$('.ui-dialog-content.cba_dialog_yellow:visible').cbadialogyellow('close');
    }

    // asp.net disables a <span> that contains the checkbox at page load
    function enableCheckBox(checkBox) {
        checkBox.disabled = false;
        if (checkBox.parentNode) checkBox.parentNode.disabled = false;
    }


    // if any of the children is disabled, the parent must be disabled
    function disableParent(parent, children) {
        for (var i = 0; i < children.length; i++) {
            if (children[i].disabled) {
                parent.disabled = true;
                return;
            }
        }
        enableCheckBox(parent);
    }

    function setMandatoryParent(e, obj) {
        for (var i = 0; i < obj.children.length; i++) {
            if (obj.children[i].checked) {
                setCheckBoxState(obj.parent, true);
                obj.parent.disabled = true;
                if (obj.disabledParent) disableParent(obj.disabledParent, obj.disabledChildren);
                return;
            }
        }
        enableCheckBox(obj.parent);
        if (obj.disabledParent) disableParent(obj.disabledParent, obj.disabledChildren);
    }

    /* if any child checkBox is selected, select & disable the parent checkBox
    otherwise, enable the parent checkBox.
    if it's a bottom row, enable or disable the top left box  */
    function mandatoryParent(parentCheckBoxIdSubstring, childCheckBoxIdSubstring,
        disabledChildrenIdSubstring, disabledParentIdSubstring) {

        var params = {};
        params.parent = getCheckboxesByIdContaining(parentCheckBoxIdSubstring)[0];
        if (params.parent === null) return;
        params.children = getCheckboxesByIdContaining(childCheckBoxIdSubstring);
        params.disabledChildren = getCheckboxesByIdContaining(disabledChildrenIdSubstring);
        if (disabledParentIdSubstring) // only bottom-row rules have disabledParent
            params.disabledParent = getCheckboxesByIdContaining(disabledParentIdSubstring)[0];

        for (var i = 0; i < params.children.length; i++) {
            setMandatoryParent(this, params);
            $(params.children[i]).click(function () {
                setMandatoryParent(this, params);
            });
        }
    }

    // Credit card payment reminder checkboxes
    function updateCheckBox() {
        // access these variables from the namespace, because this function is called by both RegisterStartupFunction and AddClientEventListener
        var c = $.CbaCustomJs.pageControls;
        var pageData = $.CbaCustomJs.pageData;

        var maxCheckbox = pageData["maxCheckbox"];
        var chkList = c.chkListCC;
        var selected = chkList.value();
        var items = chkList.items();
        if (selected.length < maxCheckbox) {
            // enable all
            $.each(chkList.items(), function (i, li) {
                li.enable();
            });
        } else if (selected.length == maxCheckbox) {
            $.each(chkList.items(false), function (i, li) {
                li.disable();
            });
        }
    }

    function messagePreferencesInit() {
        selectAll('EmailMasterCheckbox', 'EmailCheckbox');
        selectAll('SMSMasterCheckbox', 'SMSCheckbox');
        selectAll('MarketingMessageParentCheckbox', 'ParentChildMessageCheckbox');
        selectAll('MarketingEmailParentCheckboxChild', 'ChildEmail');
        selectAll('MarketingSMSParentCheckboxChild', 'ChildSMS');
        mandatoryParent('UpgradeParentChildMessageCheckbox', 'UpgradeChild', 'ParentChildMessageCheckbox', 'MarketingMessageParentCheckbox');
        mandatoryParent('NewProductParentChildMessageCheckbox', 'NewProductChild', 'ParentChildMessageCheckbox', 'MarketingMessageParentCheckbox');
        mandatoryParent('MarketingMessageParentCheckbox', 'ParentCheckboxChild', 'ParentChildMessageCheckbox');
    }

    //======== CustomiseQuickLinks.aspx ===========
    var CustomiseQuickLinks = {};

    CustomiseQuickLinks.ClearAllCheckBoxes = function () {
        CustomiseQuickLinks.allCheckboxes.attr('checked', false).attr('disabled', false);
        CustomiseQuickLinks.RefreshStatus();
    };

    CustomiseQuickLinks.RefreshStatus = function () {
        var c = $.CbaCustomJs.pageControls;
        var MAX_NUMBER_OF_LINKS = $.CbaCustomJs.pageData["MaxNumberOfLinks"];
        var numberOfQuickLinkSelected = CustomiseQuickLinks.allCheckboxes.filter(':checked').length;
        if (numberOfQuickLinkSelected == MAX_NUMBER_OF_LINKS) {
            CustomiseQuickLinks.allCheckboxes.filter(':not(:checked)').attr('disabled', true);
        } else {
            CustomiseQuickLinks.allCheckboxes.attr('disabled', false);
        }
        var numberOfLinksLeft = MAX_NUMBER_OF_LINKS - numberOfQuickLinkSelected;
        var formatString = "You have <strong>" + numberOfLinksLeft + "<\/strong> quick link" + ((numberOfLinksLeft != 1) ? "s" : "") + " left to select. ";
        formatString += (numberOfQuickLinkSelected > 4) ? "Untick one of your selections or <a href='javascript:void(0)' onclick='$.CbaCustomJs.api.CustomiseQuickLinks.ClearAllCheckBoxes(); return false;'>clear all selected quick links<\/a>." : "";
        c.statusLine.field().html(formatString);
    };

    CustomiseQuickLinks.Init = function () {
        var pageData = $.CbaCustomJs.pageData;
        var pnlQuickLinkWrapper = $("#" + pageData["pnlQuickLinkWrapperId"]);
        CustomiseQuickLinks.allCheckboxes = $('input.checkbox', pnlQuickLinkWrapper);
        CustomiseQuickLinks.RefreshStatus();

        // manually wire up click event, since using event delegation
        pnlQuickLinkWrapper.click(CustomiseQuickLinks.RefreshStatus);
    };

    /*======== contact details ========*/
    function DisplayState(c, pageData) {
        var selectedItem = c.txtSuburbPostcode.exec("selectedItem");
        // populated another field based on selected item
        if (selectedItem) {
            c.lblState.val(selectedItem["State"]);
        }
    }

    function DisplayStateRow(c, pageData, rowControls) {
        var selectedItem = rowControls.txtAMASuburbPostcode.exec("selectedItem");
        // populated another field based on selected item
        if (selectedItem) {
            rowControls.lblAMAStateCountry.val(selectedItem["State"] + " AUSTRALIA");
        }
    }

    function EmailFocusHandler(c, pageData) {
        if (c.etbEmailAddress.field().val().length == 0) {
            c.etbEmailAddress.field().focus();
        }
    }

    function HomeFocusHandler(c, pageData) {
        if (c.txtHomePhone.field().val().length == 0) {
            c.txtHomePhone.field().focus();
        }
    }

    function WorkFocusHandler(c, pageData) {
        if (c.txtWorkPhone.field().val().length == 0) {
            c.txtWorkPhone.field().focus();
        }
    }

    function JumpError(pdata) {
        var data = $.parseJSON(pdata),
            message = data.message,
            confirmUrl = data.confirmUrl,
            cancelUrl = data.cancelUrl,
            userConfirm = confirm(message);

        if (userConfirm) {
            //They have pressed the confirm
            document.location.href = confirmUrl;
        } else {
            //They have pressed cancel
            document.location.href = cancelUrl;
        }
    }

    function WealthLauncherLink() {
        window.name = "NetBank";
        $("a.WealthLauncherLink").click(function (e) {
            var thisLink = $(this),
                linkHref = thisLink.attr("href"),
                winHeight = 400,
                winWidth = 900;

            window.open(linkHref, 'SDW', 'width=' + winWidth + ', height=' + winHeight + ',resizable=yes,scrollbars=yes,titlebar=yes,menubar=yes,toolbar=yes,location=yes');
            return false;
        });
    }

    function OpenMywealthWindow(pdata) {
            var data = $.parseJSON(pdata),
                MywealthLandingPageUrl = data.Mywealthlandingpageurl,
                Formname = data.Formname,
                Hiddenfieldname = data.HiddenFieldname,
                Hiddenfieldvalue = data.HiddenFieldValue,
                navigateUrl = data.navigateUrl;

            if (navigateUrl.indexOf("MyContactDetails.aspx") != -1 || navigateUrl.indexOf("Home.aspx") != -1 || navigateUrl.indexOf("MyWealthOffers.aspx") != -1 || navigateUrl.indexOf("Home2.aspx") != -1 || navigateUrl.indexOf("HomeLoanCalculator.aspx") != -1) {
                window.name = "SDW";
            }

            var form = document.createElement("form");
            form.setAttribute("id", Formname);
            form.setAttribute("name", Formname);
            form.setAttribute("method", "post");
            form.setAttribute("action", MywealthLandingPageUrl);
            form.setAttribute("target", "SDW");

            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", Hiddenfieldname);
            hiddenField.setAttribute("value", Hiddenfieldvalue);
            form.appendChild(hiddenField);
            document.body.appendChild(form);
            form.submit();
        }
        //============== Account Info Pages ==============

    function GetConfirmationLetterStatus() {
        $.cbaPostback('GetConfirmationLetterStatus');
    }

    function GetParticipatingMCAccounts() {
        $.cbaPostback('GetParticipatingMCAccounts');
    }

    function HideControlPanels(documentName) {
        var c = $.CbaCustomJs.pageControls;
        if (documentName != '') {
            if (documentName == 'hide') {
                $('.pnlAccountActivityInfoCSS').hide();
                c.pnlAccountActivityInfo.hide();
                c.pnlAccountDocuments.hide();
            } else {
                $('#ctl00_BodyPlaceHolder_gridAccountDocuments tr').each(function () {
                    var lnkDocument = $(this).find(".pdf");
                    if (lnkDocument.html() === documentName) {
                        $(this).hide();
                    }
                });
            }
        } else {
            $('.pnlAccountActivityInfoCSS').show();
            c.pnlAccountActivityInfo.show();
            c.pnlAccountDocuments.show();
        }
    }

    function HideDetailedSummaryRow(documentName) {
        var c = $.CbaCustomJs.pageControls;
        $('.pnlAccountActivityInfoCSS').hide();
        c.pnlAccountActivityInfo.hide();
        c.pnlAccountDocuments.hide();
        ShowHideDetailedSummaryRow(documentName, false);
    }

    function ShowDetailedSummaryRow(documentName) {
        var c = $.CbaCustomJs.pageControls;
        $('.pnlAccountActivityInfoCSS').show();
        c.pnlAccountActivityInfo.show();
        c.pnlAccountDocuments.show();
        ShowHideDetailedSummaryRow(documentName, true);
    }

    function ShowHideDetailedSummaryRow(documentName, isDisplay) {
        $('#ctl00_BodyPlaceHolder_gridAccountDocuments tr').each(function () {
            var lnkDocument = $(this).find(".pdf");
            if (lnkDocument.html() === documentName) {
                if (isDisplay) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            }
        });
    }

    function ShowSpinner(show) {

        if (show) {
            $('.loadingOverlay').show();
            $('.loadingSpinner').show();
        } else {
            $('.loadingOverlay').hide();
            $('.loadingSpinner').hide();
        }
    }


    var _executeAjaxHandler = function (handler, args) {
        aspnetForm_submitted = false;
        if (args === null || args === undefined) $.cbaPostback(handler);
        else $.cbaPostback(handler, args);
    }
    $('.account-documents-grid tbody tr').on('mouseenter',
            function () {
                $(this).addClass("th_hover hover row_highlighted");
            })
        .on('mouseleave',
            function () {
                $(this).removeClass("th_hover hover row_highlighted");
            }
        );

    $('.account-documents-grid .email-column a.email-dialog-link').bind('click', function (e) {
        var selectedDoc = $(this).parent('.email-column').siblings('.doclink-column').children();
        var selectedDocname = selectedDoc.text();
        var initSubject = $('.email-documents-dialog .email-dialog-subject').find('input').val();
        var initMessage = $('.email-documents-dialog .email-dialog-message').find('textarea').val();
        resetEmailForm(initSubject, initMessage);
        populateSelectedDoc(selectedDoc, selectedDocname);
        openEmailDocumentDialog(initSubject, initMessage);
        updateDocumentDialogTitleText();
        e.preventDefault();
    });

    function openEmailDocumentDialog(initSubject, initMessage) {
        $('.email-documents-dialog').cbadialogyellow('open');
        $('.ui-dialog-titlebar .ui-dialog-titlebar-close, .email-documents-dialog .email-dialog-cancel-btn').bind('click', function () {
            closeEmailDocumentDialog(initSubject, initMessage);
        });
        $(".email-documents-dialog .email-dialog-subject input").on('change keyup paste', function () {
            updateDocumentDialogTitleText();
        });
    }

    function updateDocumentDialogTitleText() {
        var emailDialog = $('.cba_dialog_yellow').has('.email-documents-dialog');
        emailDialog.find('.ui-dialog-title').text($('.email-documents-dialog .email-dialog-subject').find('input').val());
    }

    function closeEmailDocumentDialog(initSubject, initMessage) {
        clearDialogFormFields(initSubject, initMessage);
        $('.email-documents-dialog').cbadialogyellow('close');
    }

    function populateSelectedDoc(docitem, docname) {
        docitem.clone().children().appendTo('.dialog-doc-list').wrap('<li class="selected_doc"></li>');
        $('.email-documents-dialog').find('.email-doc-list-hidden input').val($.trim(docname));
    }

    function resetEmailForm(initSubject, initMessage) {
        $('.email-documents-dialog').cbadialogyellow('open');
        clearDialogFormFields(initSubject, initMessage);
    }

    function clearDialogFormFields(initSubject, initMessage) {
        var dialog = $('.email-documents-dialog');
        dialog.find('.dialog-doc-list').children().remove();
        dialog.find('.email-dialog-email input, .email-dialog-cc input, .email-doc-list-hidden input').val('');
        dialog.find('.email-dialog-subject input').val(initSubject);
        dialog.find('.email-dialog-message textarea').val(initMessage);
    }

    function ShowConfirmationMsg(args) {
        closeEmailDocumentDialog();
        $('.email-confirmation-dialog').cbadialogyellow('open').find('.emailed-list').text(args);
    }

    function showEmailFailedDialog() {
        closeEmailDocumentDialog();
        $('.email-failed-dialog').cbadialogyellow('open');
    }

    function AlternateRows() {
        $(".interesttaxsummary .gv_outer table tbody tr:even").css('background-color', '#FFF', 'important');
        $(".interesttaxsummary .gv_outer table tbody tr:odd").css('background-color', '#F7F7F7', 'important');
    }

    /*** TaxSummary Export ***/
    var exportURL;

    function BindExportEvent() {
            var element = '#ctl00_BodyPlaceHolder_btnExport';
            $(document).off('click', element).on('click', element, function (event, ui) {
                window.open(exportURL);
            });
        }
        /**end**/
    function TaxSummaryExport() {
        //export 
        var pageData = $.CbaCustomJs.pageData;
        if (!pageData) return;
        var config = pageData['taxConfig'];
        exportURL = config.TaxSummaryExport;
        BindExportEvent();
        //end 
    }

    /***** register the javascript *****/
	// fix to keep this script run for unit test
	$.CbaCustomJs = $.CbaCustomJs || {};
	$.CbaCustomJs.registerCustomJs = $.CbaCustomJs.registerCustomJs ||  function() {};
	
    $.CbaCustomJs.registerCustomJs(function () {
        var result = {
            onLoad: function (sender, args) {
                CommBank.Online.Common.CurrencyHelper.init($(".pnlAccountDetailsCSS"));

                $('.tcLink').click(function () {
                    if ($(this).hasClass('open')) {
                        $('.tccontent').slideDown('slow');
                        $(this).removeClass('open').addClass('close');
                    } else {
                        $('.tccontent').slideUp('slow');
                        $(this).removeClass('close').addClass('open');
                    }
                });
            },

            api: {
                messagePreferencesInit: messagePreferencesInit,
                updateCheckBox: updateCheckBox,
                CustomiseQuickLinks: CustomiseQuickLinks,
                DisplayState: DisplayState,
                DisplayStateRow: DisplayStateRow,
                EmailFocusHandler: EmailFocusHandler,
                HomeFocusHandler: HomeFocusHandler,
                WorkFocusHandler: WorkFocusHandler,
                JumpError: JumpError,
                OpenMywealthWindow: OpenMywealthWindow,
                WealthLauncherLink: WealthLauncherLink,
                GetConfirmationLetterStatus: GetConfirmationLetterStatus,
                GetParticipatingMCAccounts: GetParticipatingMCAccounts,
                CloseConfirmDialog: CloseConfirmDialog,
                HideControlPanels: HideControlPanels,
                ShowDetailedSummaryRow: ShowDetailedSummaryRow,
                HideDetailedSummaryRow: HideDetailedSummaryRow,
                ShowSpinner: ShowSpinner,
                ShowConfirmationMsg: ShowConfirmationMsg,
                ShowEmailFailedDialog: showEmailFailedDialog,
                AlternateRows: AlternateRows,
                TaxSummaryExport: TaxSummaryExport
            }
        };

        $(document).ready(function () {
            $(".interesttaxsummary .gv_outer table tbody tr:even").css('background-color', '#FFF', 'important');
            $(".interesttaxsummary .gv_outer table tbody tr:odd").css('background-color', '#F7F7F7', 'important');
        });

        if ($('#ctl00_BodyPlaceHolder_gridAccountDocuments').length > 0) {
            result.onAsyncPostback = function onAsyncPostback(sender, args) {
                if ($('#ctl00_BodyPlaceHolder_gridAccountDocuments tr').length === 2) {
                    $('#ctl00_BodyPlaceHolder_gridAccountDocuments_r00_lnkDocument').attr('id', 'ctl00_BodyPlaceHolder_gridAccountDocuments_r02_lnkDocument');
                }
            }
            $('.account-docs-anchor').bind('click', function (e) {
                e.preventDefault();
                $('html, body').animate({
                    scrollTop: $('.account-documents-grid').offset().top
                }, 500);
                if (CommBank.Online.Common.Plugins.AccessibilityMode) {
                    $("#ctl00_BodyPlaceHolder_pnlAccountActivityInfo").attr('tabindex', 0).focus();
                } else {
                    $("#ctl00_BodyPlaceHolder_gridAccountDocuments_r00_lnkDocument").attr('tabindex', 0).focus();
                }
            });
        }
        $('.email-dialog-send-btn').on('click', function (e) {
            setTimeout(function () {
                if (typeof (Page_IsValid) !== "undefined" && !Page_IsValid) {
                    if ($('#ctl00_BodyPlaceHolder_DialogTextarea_field').hasClass('error')) {
                        $('#ctl00_BodyPlaceHolder_DialogTextarea_field').attr('aria-describedby', 'message-tip').focus();
                        $(".email-dialog-message .message-help-error").attr({
                            'tabindex': 0,
                            'role': 'tooltip',
                            'id': 'message-tip'
                        }).focus();
                    };
                    if ($('#ctl00_BodyPlaceHolder_DialogSubjectField_field').hasClass('error')) {
                        $('#ctl00_BodyPlaceHolder_DialogSubjectField_field').attr('aria-describedby', 'subject-tip').focus();
                        $(".email-dialog-subject .message-help-error").attr({
                            'tabindex': 0,
                            'role': 'tooltip',
                            'id': 'subject-tip'
                        }).focus();
                    };
                    if ($('#ctl00_BodyPlaceHolder_DialogCCField_field').hasClass('error')) {
                        $('#ctl00_BodyPlaceHolder_DialogCCField_field').attr('aria-describedby', 'cc-tip').focus();
                        $(".email-dialog-cc .message-help-error").attr({
                            'tabindex': 0,
                            'role': 'tooltip',
                            'id': 'cc-tip'
                        }).focus();
                    };
                    if ($('#ctl00_BodyPlaceHolder_DialogEmailField_field').hasClass('error')) {
                        $('#ctl00_BodyPlaceHolder_DialogEmailField_field').attr('aria-describedby', 'email-tip').focus();
                        $(".email-dialog-email .message-help-error").attr({
                            'tabindex': 0,
                            'role': 'tooltip',
                            'id': 'email-tip'
                        }).focus();
                    };
                } else {
                    $('#ctl00_BodyPlaceHolder_DialogTextarea_field, #ctl00_BodyPlaceHolder_DialogSubjectField_field, #ctl00_BodyPlaceHolder_DialogCCField_field, #ctl00_BodyPlaceHolder_DialogEmailField_field').removeAttr('aria-describedby');
                }
            }, 500);
        });
        return result;
    });
})();

// Support asynchronous loading. Following line must remain EXACTLY as is.
if (typeof Sys !== 'undefined') {
	Sys.Application.notifyScriptLoaded();
}
// DeActive for Comm Bank Check out

// Expand & Collpase Tree view for DeActivate CommBank check out


function ShowDeActiveComBankCheckOut() {
    if ($("#divDeActiveComBankCheckOut").hasClass("commBankExpand")) {
        $("#divDeActiveComBankCheckOut").removeClass("commBankExpand").addClass("commBankCollapse");
        $("#divDeactivateSection").show();
    } else if ($("#divDeActiveComBankCheckOut").hasClass("commBankCollapse")) {
        $("#divDeActiveComBankCheckOut").removeClass("commBankCollapse").addClass("commBankExpand");
        $("#divDeactivateSection").hide();
    }
}