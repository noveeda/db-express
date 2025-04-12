function toggleEditMode(commentId) {
  const commentBlock = document.getElementById(commentId);
  const spanText = commentBlock.querySelector(".comment-text");
  const editForm = commentBlock.querySelector(".comment-edit-form");
  const textarea = editForm.querySelector("textarea");

  const isEditing = editForm.style.display === "block";

  if (isEditing) {
    // 저장을 위해 form 제출
    editForm.submit();
  } else {
    // 수정 모드 전환
    spanText.style.display = "none";
    editForm.style.display = "block";
    textarea.focus();
    const button = commentBlock.getElementsByClassName("com-edit-btn");
    button.textContent = "저장";
  }
}

// function searchPosts() {
//   // 검색 타입
//   const searchType = document.getElementById("search-type");
//   //
//   const selectedOption =
//     searchType.options[searchType.selectedIndex].value.trim();

//   // 검색어
//   const searchValue = document.getElementById("search-value").value.trim();

//   const url = `/board/posts?search-type=${selectedOption}&search-value=${searchValue}`;
//   window.location.href = url;
// }
