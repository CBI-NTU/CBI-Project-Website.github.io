"use strict";
var datasetData = null;
var complexData = null;
var refData = null;
var chooseFile = function (id) {
    let filePath = $(`#${id}`).get(0).files[0];
    if (!filePath) {
        if (id === "datasetSelector") {
            $("#datasetHint").text("Dataset file not selected").css("color", "red").show();
        } else if (id === "complexSelector") {
            $("#complexHint").text("Complex file not selected").css("color", "red").show();
        } else if (id === "refSelector") {
            $("#refHint").text("Reference List file not selected").css("color", "red").show();
        }
        return;
    }
    let reader = new FileReader ();
    if (id === "datasetSelector") {
        reader.onloaderror = function () {
            $("#datasetHint").text(`Error on loading ${filePath.name}!`).css("color", "red").show();
        };
        reader.onload = function () {
            $("#datasetHint").text(`Finish loading ${filePath.name}`).css("color", "blue").show();
            datasetData = reader.result;
        }
    } else if (id === "complexSelector") {
        reader.onloaderror = function () {
            $("#complexHint").text(`Error on loading ${filePath.name}!`).css("color", "red").show();
        }
        reader.onload = function () {
            $("#complexHint").text(`Finish loading ${filePath.name}`).css("color", "blue").show();
            complexData = reader.result;
        }
    } else if (id === "refSelector") {
        reader.onloaderror = function () {
            $("#refHint").text(`Error on loading ${filePath.name}!`).css("color", "red").show();
        }
        reader.onload = function () {
            $("#refHint").text(`Finish loading ${filePath.name}`).css("color", "blue").show();
            refData = reader.result;
            $("input[name='ref']").prop("disabled", false);
        }
    }
    reader.readAsText(filePath, "utf-8");
};
var getVerificationKey = function () {
    if ($("#email").val() != $("#emailConfirm").val()) {
        $("#emailHint").text("Two email is not same. Please check your email.").css("color", "red").show();
        return;
    }
    $("#emailHint").text("Email is sending. Please wait...").css("color", "blue").show();
    $.post("/getKey", {"email" : $("#email").val()}, function (data) {
        let dataJson = JSON.parse(data);
        if (!dataJson["status"]) {
            $("#emailHint").text(dataJson["note"]).css("color", "red").show();
        } else {
            $("#emailHint").css("color", "blue").show().text("Verification key sends to your email.");
        }
    });
};
var sendEmail = function () {
    if ($("#email").val() != $("#emailConfirm").val()) {
        $("#emailHint").text("Two email is not same. Please check your email.").css("color", "red").show();
        return;
    }
    let resultInputs = $("input[name='resultType']");
    if (!$("input[name='resultType']:eq(0)").prop("checked") && !$("input[name='resultType']:eq(1)").prop("checked")) {
        $("#emailHint").text("You must specify at least one result type.").css("color", "red").show();
    }
    $("#emailHint").text("Your request is sending. Please wait...").css("color", "blue").show();
    let postData = {
        "email" : $("#email").val(),
        "key" : $("#key").val(),
        "cplx" : complexData,
        "dset" : datasetData,
        "ref" : refData,
        "iter" : $("#iterInput").val(),
        "minsize" : $("#minsizeInput").val(),
        "mafdr" : $("#mafdrInput").val(),
        "scoreset" : $("#protrecscoresetInput").val(),
        "fdrset" : $("#fdrsetInput").val(),
        "onlyProtrec" : $("input[name='resultKind']:eq(0)").prop("checked"),
        "requireRawMatrix" : $("input[name='resultType']:eq(0)").prop("checked"),
        "require01Matrix" : $("input[name='resultType']:eq(1)").prop("checked"),
        "recoveryRate" : $("input[name='ref']:eq(0)").prop("checked"),
        "scoreDistribution" : $("input[name='ref']:eq(1)").prop("checked")
    };
    $.post("/sendEmail", postData, function (data) {
        let dataJson = JSON.parse(data)
        if (!dataJson["status"]) {
            $("#emailHint").text(dataJson["note"]).css("color", "red").show();
        } else {
            $("#emailHint").text("We have receive your request. Please wait for our response.").css("color", "blue").show();
        }
    });
};
var sendUserMessage = function () {
    if ($("#username").val() === "") {
        $("#msgHint").val("Please enter your name").css("color", "red").show();
    } else if ($("#useremail").val() === "") {
        $("#msgHint").val("Please enter your email").css("color", "red").show();
    } else if ($("#usermessage").val() === "") {
        $("#msgHint").val("Please enter your message").css("color", "red").show();
    } else {
        $("#msgHint").val("Your inquiry is sending to us... Please wait for a moment.").css("color", "blue").show();
        let postData = {
            "name" : $("#username").val(),
            "email" : $("#useremail").val(),
            "message" : $("#usermessage").val()
        };
        $.post("/sendInquiry", postData, function (data) {
            let dataJson = JSON.parse(data);
            if (!dataJson["status"]) {
                $("#msgHint").text(dataJson["note"]).css("color", "red").show();
            } else {
                $("#msgHint").text("We have received your inquiry.").css("color", "blue").show();
            }
        });
    }
    return false;
};
$(function () {
    $("#datasetSelector").val(null);
    $("#complexSelector").val(null);
    $("#refSelector").val(null);
    $("#iterInput").val("1000");
    $("#minsizeInput").val("5");
    $("#mafdrInput").val("0.01");
    $("#protrecscoresetInput").val("0.95");
    $("#fdrsetInput").val("0.05");
    $("input[name='resultKind']:eq(0)").prop("checked", true);
    $("input[name='resultType']:eq(0)").prop("checked", true);
    $("input[name='resultType']:eq(1)").prop("checked", false);
    $("input[name='ref']").prop("checked", false).prop("disabled", true);
});