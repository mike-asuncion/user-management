var allUsers = [];
var options = {};
var currentPage = 1;
var pageSize = 10;
var editingId = "";
var deletingId = "";
var userModal;
var deleteModal;

$(function () {
  userModal = new bootstrap.Modal("#userModal");
  deleteModal = new bootstrap.Modal("#deleteModal");

  setupNavigation();
  setupSearchAndFilters();
  setupUserActions();
  loadData();
});

function loadData() {
  $.ajaxSetup({ cache: false });

  $.when($.getJSON("data/users.json"), $.getJSON("data/options.json"))
    .done(function (usersResult, optionsResult) {
      allUsers = usersResult[0];
      options = optionsResult[0];
      fillAllSelects();
      showUsers();
    })
    .fail(function () {
      $("#userRows").html('<tr><td colspan="12" class="loading-cell text-danger">Users could not load. Start the project with npm run cms, then open http://localhost:3030.</td></tr>');
    });
}

function setupNavigation() {
  $(".side-toggle.open").next(".side-sub").show();

  $("#topNav .top-nav-link").clone().removeClass("top-nav-link").addClass("side-sub-link").appendTo("#drawerMainSub");
  $("#sideMenu").children().clone().appendTo("#drawerSide");

  $(document).on("click", ".side-toggle", function () {
    var button = $(this);
    button.next(".side-sub").stop(true, true).slideToggle(250);
    button.toggleClass("open");
  });

  $(document).on("click", "[data-page]", function (event) {
    event.preventDefault();
    openPage($(this).attr("data-page"));
    closeDrawer();
  });

  $(".nav-arrow-right").on("click", function () {
    $("#topNav").stop(true).animate({ scrollLeft: "+=220" }, 300);
  });

  $(".nav-arrow-left").on("click", function () {
    $("#topNav").stop(true).animate({ scrollLeft: "-=220" }, 300);
  });

  $("#topNav").on("scroll", updateNavArrows);

  $(window).on("resize", function () {
    updateNavArrows();
    if ($(window).width() >= 992) {
      closeDrawer();
    }
  });

  updateNavArrows();

  $("#topSearchButton").on("click", function () {
    openPage("users");
    $("html, body").animate({ scrollTop: 0 }, 200, function () {
      $("#searchInput").trigger("focus");
    });
  });
}

function updateNavArrows() {
  var nav = $("#topNav");
  var scrolled = nav.scrollLeft();
  var hiddenWidth = nav[0].scrollWidth - nav.innerWidth();

  $(".nav-arrow-left").toggle(scrolled > 2);
  $(".nav-arrow-right").toggle(scrolled < hiddenWidth - 2);
}

function closeDrawer() {
  var drawer = bootstrap.Offcanvas.getInstance("#mobileMenu");
  if (drawer) {
    drawer.hide();
  }
}

function openPage(pageName) {
  $("[data-page]").removeClass("active");
  $('[data-page="' + pageName + '"]').addClass("active");

  $(".side-toggle").removeClass("active");
  $(".side-sub").has(".active").prev(".side-toggle").addClass("active");

  if (pageName === "users") {
    $("#blankPage").hide();
    $("#usersPage").stop(true, true).fadeIn(200);
  } else {
    $("#usersPage").hide();
    $("#blankTitle").text(pageName);
    $("#blankPage").stop(true, true).fadeIn(200);
  }
}

function fillSelect(selector, list, firstText) {
  var select = $(selector);
  select.empty();

  if (firstText) {
    select.append($("<option>").val("").text(firstText));
  }

  $.each(list, function (index, item) {
    select.append($("<option>").val(item).text(item));
  });
}

function fillAllSelects() {
  fillSelect("#statusFilter", options.statuses, "All");
  fillSelect("#regionFilter", options.regions, "All");
  fillSelect("#divisionFilter", options.divisions, "All");
  fillSelect("#groupFilter", options.groups, "All");

  fillSelect("#formGroup", options.groups);
  fillSelect("#formUserType", options.userTypes);
  fillSelect("#formDivision", options.divisions);
  fillSelect("#formRegion", options.regions);
  fillSelect("#formStatus", options.statuses);
}

function setupSearchAndFilters() {
  if ($(window).width() < 768) {
    $("#filterPanel").hide();
    $("#filterToggle").attr("aria-expanded", "false");
  }

  $("#searchInput").on("input", function () {
    $("#clearSearch").toggle($(this).val() !== "");
    currentPage = 1;
    showUsers();
  });

  $("#clearSearch").on("click", function () {
    $("#searchInput").val("").trigger("input").trigger("focus");
  });

  $("#searchField, .filter-select").on("change", function () {
    currentPage = 1;
    showUsers();
  });

  $("#pageSize").on("change", function () {
    pageSize = parseInt($(this).val(), 10);
    currentPage = 1;
    showUsers();
  });

  $("#filterToggle").on("click", function () {
    var button = $(this);
    $("#filterPanel").stop(true, true).slideToggle(250, function () {
      button.attr("aria-expanded", $("#filterPanel").is(":visible"));
    });
  });

  $("#clearFilters, #emptyClear").on("click", function () {
    clearSearchAndFilters();
    showUsers();
  });

  $("#pagination").on("click", ".page-link", function (event) {
    event.preventDefault();
    var item = $(this).parent();

    if (item.hasClass("disabled") || item.hasClass("active")) {
      return;
    }

    currentPage = parseInt($(this).attr("data-number"), 10);
    showUsers();
    $("html, body").animate({ scrollTop: $("#usersPage").offset().top - 80 }, 200);
  });
}

function clearSearchAndFilters() {
  $("#searchInput").val("");
  $("#clearSearch").hide();
  $("#searchField").val("all");
  $(".filter-select").val("");
  currentPage = 1;
}

function getSearchText(user, field) {
  if (field === "all") {
    return [user.id, user.firstName, user.lastName, user.email, user.group, user.division, user.region, user.userType, user.status].join(" ");
  }
  return String(user[field]);
}

function getFilteredUsers() {
  var searchText = $("#searchInput").val().trim().toLowerCase();
  var searchField = $("#searchField").val();
  var status = $("#statusFilter").val();
  var region = $("#regionFilter").val();
  var division = $("#divisionFilter").val();
  var group = $("#groupFilter").val();

  return $.grep(allUsers, function (user) {
    if (status && user.status !== status) {
      return false;
    }
    if (region && user.region !== region) {
      return false;
    }
    if (division && user.division !== division) {
      return false;
    }
    if (group && user.group !== group) {
      return false;
    }
    if (searchText === "") {
      return true;
    }
    return getSearchText(user, searchField).toLowerCase().indexOf(searchText) > -1;
  });
}

function showUsers() {
  var users = getFilteredUsers();
  var totalPages = Math.max(1, Math.ceil(users.length / pageSize));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  var start = (currentPage - 1) * pageSize;
  var pageUsers = users.slice(start, start + pageSize);
  var rows = $("#userRows").empty();

  $.each(pageUsers, function (index, user) {
    rows.append(makeRow(user));
  });

  rows.children().hide().fadeIn(200);

  $("#emptyState").toggle(users.length === 0);
  showCount(users.length, start, pageUsers.length);
  showPagination(totalPages);
  showFilterCount();
}

function makeCell(label, value, className) {
  var cell = $("<td>").attr("data-label", label).text(value || "-");
  if (className) {
    cell.addClass(className);
  }
  return cell;
}

function makeStatusBadge(status) {
  var color = "text-bg-success";
  if (status === "Pending") {
    color = "text-bg-warning";
  }
  if (status === "Disabled") {
    color = "text-bg-secondary";
  }
  return $("<span>").addClass("badge rounded-pill " + color).text(status);
}

function makeActionButton(className, icon, title) {
  return $("<button>")
    .attr({ type: "button", title: title, "aria-label": title })
    .addClass("action-button " + className)
    .html('<i class="bi ' + icon + '"></i>');
}

function makeRow(user) {
  var row = $("<tr>").attr("data-id", user.id);
  var fullName = user.firstName + " " + user.lastName;

  row.append(makeCell("ID", user.id, "id-cell"));
  row.append(makeCell("First Name", user.firstName));
  row.append(makeCell("Last Name", user.lastName));
  row.append(makeCell("Username/Email", user.email, "email-cell").attr("title", user.email));
  row.append(makeCell("Group", user.group));
  row.append(makeCell("Division", user.division));
  row.append(makeCell("Region", user.region));
  row.append(makeCell("User Type", user.userType));
  row.append($("<td>").attr("data-label", "Status").append(makeStatusBadge(user.status)));
  row.append(makeCell("Submitted Date", user.submittedDate));
  row.append(makeCell("Enabled Date", user.enabledDate));

  var actions = $("<td>").attr("data-label", "Actions").addClass("action-cell");
  actions.append(makeActionButton("edit-button", "bi-pencil-square", "Edit " + fullName));

  if (user.status === "Disabled") {
    actions.append(makeActionButton("status-button", "bi-check-circle", "Enable " + fullName));
  } else {
    actions.append(makeActionButton("status-button", "bi-slash-circle", "Disable " + fullName));
  }

  actions.append(makeActionButton("delete-button", "bi-trash3", "Delete " + fullName));
  row.append(actions);

  return row;
}

function showCount(total, start, shown) {
  var from = total === 0 ? 0 : start + 1;
  var to = start + shown;
  var text = "Showing " + from + " to " + to + " of " + total + " entries";

  if (total !== allUsers.length) {
    text = text + " (filtered from " + allUsers.length + ")";
  }

  $("#countText").text(text);
}

function addPageButton(list, text, pageNumber, isActive, isDisabled) {
  var item = $("<li>").addClass("page-item");

  if (isActive) {
    item.addClass("active");
  }
  if (isDisabled) {
    item.addClass("disabled");
  }

  var link = $("<a>").addClass("page-link").attr({ href: "#", "data-number": pageNumber }).text(text);
  list.append(item.append(link));
}

function showPagination(totalPages) {
  var list = $("#pagination").empty();
  var firstPage = Math.max(1, currentPage - 2);
  var lastPage = Math.min(totalPages, firstPage + 4);
  firstPage = Math.max(1, lastPage - 4);

  addPageButton(list, "Previous", currentPage - 1, false, currentPage === 1);

  for (var number = firstPage; number <= lastPage; number++) {
    addPageButton(list, number, number, number === currentPage, false);
  }

  addPageButton(list, "Next", currentPage + 1, false, currentPage === totalPages);
}

function showFilterCount() {
  var count = $(".filter-select").filter(function () {
    return $(this).val() !== "";
  }).length;

  var badge = $("#filterCount").text(count);
  if (count > 0) {
    badge.fadeIn(150);
  } else {
    badge.hide();
  }
}

function findUser(id) {
  return $.grep(allUsers, function (user) {
    return user.id === id;
  })[0];
}

function setupUserActions() {
  $("#addUserButton").on("click", function () {
    openUserForm(null);
  });

  $("#userRows").on("click", ".edit-button", function () {
    var id = $(this).closest("tr").attr("data-id");
    openUserForm(findUser(id));
  });

  $("#userRows").on("click", ".status-button", function () {
    var id = $(this).closest("tr").attr("data-id");
    toggleStatus(findUser(id));
  });

  $("#userRows").on("click", ".delete-button", function () {
    var user = findUser($(this).closest("tr").attr("data-id"));
    deletingId = user.id;
    $("#deleteName").text(user.firstName + " " + user.lastName);
    deleteModal.show();
  });

  $("#confirmDelete").on("click", deleteUser);

  $("#userForm").on("submit", function (event) {
    event.preventDefault();
    saveUser();
  });

  $("#userForm input").on("input", function () {
    $(this).removeClass("is-invalid");
  });

  $("#userModal").on("shown.bs.modal", function () {
    $("#formFirstName").trigger("focus");
  });
}

function openUserForm(user) {
  $("#userForm .is-invalid").removeClass("is-invalid");

  if (user) {
    editingId = user.id;
    $("#userModalTitle").text("Edit user " + user.id);
    $("#saveUserButton").text("Save changes");
    $("#formFirstName").val(user.firstName);
    $("#formLastName").val(user.lastName);
    $("#formEmail").val(user.email);
    $("#formGroup").val(user.group);
    $("#formUserType").val(user.userType);
    $("#formDivision").val(user.division);
    $("#formRegion").val(user.region);
    $("#formStatus").val(user.status);
  } else {
    editingId = "";
    $("#userModalTitle").text("Add user");
    $("#saveUserButton").text("Add user");
    $("#userForm")[0].reset();
    $("#formStatus").val("Active");
  }

  userModal.show();
}

function isEmailTaken(email) {
  var taken = false;

  $.each(allUsers, function (index, user) {
    if (user.id !== editingId && user.email.toLowerCase() === email.toLowerCase()) {
      taken = true;
    }
  });

  return taken;
}

function checkForm() {
  var isValid = true;
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var email = $("#formEmail").val().trim();

  $("#formFirstName, #formLastName").each(function () {
    if ($(this).val().trim() === "") {
      $(this).addClass("is-invalid");
      isValid = false;
    }
  });

  if (!emailPattern.test(email)) {
    $("#emailError").text("Enter a valid email address.");
    $("#formEmail").addClass("is-invalid");
    isValid = false;
  } else if (isEmailTaken(email)) {
    $("#emailError").text("Another user already has this email.");
    $("#formEmail").addClass("is-invalid");
    isValid = false;
  }

  return isValid;
}

function getFormData() {
  return {
    firstName: $("#formFirstName").val().trim(),
    lastName: $("#formLastName").val().trim(),
    email: $("#formEmail").val().trim(),
    group: $("#formGroup").val(),
    userType: $("#formUserType").val(),
    division: $("#formDivision").val(),
    region: $("#formRegion").val(),
    status: $("#formStatus").val()
  };
}

function saveUser() {
  if (!checkForm()) {
    return;
  }

  var formData = getFormData();
  var savedId = editingId;

  if (editingId) {
    var user = findUser(editingId);
    $.extend(user, formData);
    if (user.status === "Active" && !user.enabledDate) {
      user.enabledDate = getToday();
    }
    showMessage("User " + user.id + " updated.");
  } else {
    formData.id = makeNewId();
    formData.submittedDate = getToday();
    formData.enabledDate = formData.status === "Active" ? getToday() : "";
    allUsers.unshift(formData);
    savedId = formData.id;
    clearSearchAndFilters();
    showMessage("User " + formData.id + " added.");
  }

  userModal.hide();
  showUsers();
  markRow(savedId);
}

function toggleStatus(user) {
  if (user.status === "Disabled") {
    user.status = "Active";
    user.enabledDate = getToday();
    showMessage(user.firstName + " " + user.lastName + " enabled.");
  } else {
    user.status = "Disabled";
    showMessage(user.firstName + " " + user.lastName + " disabled.");
  }

  showUsers();
  markRow(user.id);
}

function deleteUser() {
  var user = findUser(deletingId);
  var row = $('#userRows tr[data-id="' + deletingId + '"]');

  allUsers = $.grep(allUsers, function (item) {
    return item.id !== deletingId;
  });

  deleteModal.hide();
  showMessage(user.firstName + " " + user.lastName + " deleted.");

  row.fadeOut(250, function () {
    showUsers();
  });
}

function markRow(id) {
  var row = $('#userRows tr[data-id="' + id + '"]');
  row.addClass("new-row");
  setTimeout(function () {
    row.removeClass("new-row");
  }, 1500);
}

function makeNewId() {
  var highest = 0;

  $.each(allUsers, function (index, user) {
    var number = parseInt(user.id, 10);
    if (number > highest) {
      highest = number;
    }
  });

  return String(highest + 1).padStart(4, "0");
}

function getToday() {
  var now = new Date();
  var month = String(now.getMonth() + 1).padStart(2, "0");
  var day = String(now.getDate()).padStart(2, "0");
  return month + "/" + day + "/" + now.getFullYear();
}

function showMessage(text) {
  $("#messageBox").stop(true, true).text(text).fadeIn(200).delay(2200).fadeOut(300);
}
