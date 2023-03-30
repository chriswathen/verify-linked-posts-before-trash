jQuery(document).ready(function ($) {
	$('.submitdelete').on('click', function (e) {
		e.preventDefault();
		const trashButton = $(this);
		const trashURL = trashButton.attr('href');
		const postId = trashButton.closest('td').find('div[id^="inline_"]').attr('id').replace('inline_', '');

		console.log('Clicked trash button for Post ID:', postId); // Add console log

		$.ajax({
			type: 'POST',
			url: vlpbt_data.ajax_url,
			data: {
				action: 'vlpbt_check_linked_posts',
				post_id: postId,
			},
			success: function (response) {
				console.log('AJAX response:', response); // Add console log
				const linkedPosts = JSON.parse(response);

				if (linkedPosts.length > 0) {
					let message = '<p>There are posts that link to this post:</p><ul>';
					linkedPosts.forEach(function (post) {
						message += `<li><a href="${vlpbt_data.ajax_url.replace(
							'admin-ajax.php',
							'post.php',
						)}?post=${post.ID}&action=edit" target="_blank">${post.title} (ID: ${
							post.ID
						}, Post Type: ${post.post_type})</a></li>`;
					});
					message += '</ul><p>Do you want to continue with the trash action?</p>';

					Swal.fire({
						title: 'Warning',
						html: message,
						icon: 'warning',
						showCancelButton: true,
						confirmButtonText: 'Yes, trash it!',
						cancelButtonText: 'No, cancel',
						customClass: {
							container: 'wp-swal-container',
							title: 'wp-swal-title',
							content: 'wp-swal-content',
							actions: 'wp-swal-actions',
							confirmButton: 'wp-swal-confirm-button',
							cancelButton: 'wp-swal-cancel-button',
						},
					}).then((result) => {
						if (result.isConfirmed) {
							window.location.href = trashButton.attr('href');
						}
					});
				} else {
					window.location.href = trashButton.attr('href');
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log('AJAX error:', textStatus, errorThrown); // Add console log
			},
		});
	});
});
